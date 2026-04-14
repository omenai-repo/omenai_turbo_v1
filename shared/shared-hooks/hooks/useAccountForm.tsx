"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRollbar } from "@rollbar/react";
import { toast } from "sonner";
import { BankBranchType, BankType } from "@omenai/shared-types";
import { validateBankAccount } from "@omenai/shared-services/wallet/validateAccount";
import { addPrimaryAccount } from "@omenai/shared-services/wallet/addPrimaryAccount";
import { toast_notif } from "@omenai/shared-utils/src/toast_notification";
import { ValidationUtils } from "@omenai/shared-utils/src/validator";
import { useAuth } from "./useAuth";
import { fetchUser } from "@omenai/shared-services/auth/session/fetchUser";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const COUNTRIES_WITH_BANK_BRANCHES = [
  "BJ",
  "CM",
  "TD",
  "CI",
  "CG",
  "GA",
  "GH",
  "MW",
  "RW",
  "SN",
  "SL",
  "TZ",
  "UG",
];

export const AFRICAN_COUNTRIES = [
  "NG",
  "GH",
  "KE",
  "UG",
  "ZA",
  "TZ",
  "RW",
  "CM",
  "CI",
  "SN",
  "BJ",
  "TD",
  "CG",
  "GA",
  "MW",
  "SL",
  "EG",
  "MA",
];

export const SEPA_COUNTRY_CODES = [
  "AD",
  "AT",
  "BE",
  "BG",
  "CH",
  "CY",
  "CZ",
  "DE",
  "DK",
  "EE",
  "ES",
  "FI",
  "FR",
  "GR",
  "HR",
  "HU",
  "IE",
  "IS",
  "IT",
  "LI",
  "LT",
  "LU",
  "LV",
  "MC",
  "MT",
  "NL",
  "NO",
  "PL",
  "PT",
  "RO",
  "SE",
  "SI",
  "SK",
  "SM",
  "VA",
];

export type RegionType = "africa" | "uk" | "eu" | "us" | "international";

export interface ValidatedAccount {
  isValidated: boolean;
  account_name: string;
  account_number: string;
}

// ---------------------------------------------------------------------------
// Step helpers
// ---------------------------------------------------------------------------

export type StepStatus = "complete" | "active" | "upcoming";

export interface Step {
  index: number;
  label: string;
  description: string;
  status: StepStatus;
}

function resolveStepLabel(
  stepIndex: number,
  regionType: RegionType,
): { label: string; description: string } {
  const labels: Record<RegionType, { label: string; description: string }[]> = {
    africa: [
      { label: "Region", description: "Automatically detected" },
      { label: "Select Bank", description: "Choose your bank & enter account" },
      { label: "Verify", description: "Confirm account ownership" },
      { label: "Link Account", description: "Securely connect your account" },
    ],
    uk: [
      { label: "Region", description: "Automatically detected" },
      { label: "Enter Details", description: "Account number & sort code" },
      { label: "Review", description: "Check your details" },
      { label: "Link Account", description: "Securely connect your account" },
    ],
    us: [
      { label: "Region", description: "Automatically detected" },
      {
        label: "Enter Details",
        description: "Account number & routing number",
      },
      { label: "Review", description: "Check your details" },
      { label: "Link Account", description: "Securely connect your account" },
    ],
    eu: [
      { label: "Region", description: "Automatically detected" },
      { label: "Enter Details", description: "IBAN & SWIFT/BIC code" },
      { label: "Review", description: "Check your details" },
      { label: "Link Account", description: "Securely connect your account" },
    ],
    international: [
      { label: "Region", description: "Automatically detected" },
      { label: "Enter Details", description: "IBAN & SWIFT/BIC code" },
      { label: "Review", description: "Check your details" },
      { label: "Link Account", description: "Securely connect your account" },
    ],
  };
  return labels[regionType][stepIndex] ?? { label: "", description: "" };
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useAccountForm() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const rollbar = useRollbar();

  // --- Fetch User Data & Address ---
  // 1. Get the base auth session first (aliasing user to artist to match your snippet)
  const { user: artist, csrf } = useAuth({ requiredRole: "artist" });

  // 2. Fetch the rich profile data
  const { data: fetchedData, isLoading: isFetchingUser } = useQuery({
    queryKey: ["artist_profile", artist?.artist_id],
    queryFn: async () => {
      const response = await fetchUser({
        id: artist.artist_id,
        route: "artist",
        token: csrf || "",
      });

      if (!response.isOk) throw new Error("Failed to fetch user data");

      return response.artist;
    },
    // Prevent query from running until useAuth actually gives us an ID
    enabled: !!artist?.artist_id,
    refetchOnWindowFocus: false,
  });

  // 3. SAFELY resolve the user object using optional chaining (?)
  // If fetchedData is ready and has an address, use it. Otherwise, fallback to the initial auth object.
  const user = fetchedData?.address ? fetchedData : artist;

  // --- Region ---
  const regionType = useMemo<RegionType>(() => {
    const code = user.address.countryCode.toUpperCase() || "";
    if (code === "US") return "us";
    if (code === "GB") return "uk";
    if (SEPA_COUNTRY_CODES.includes(code)) return "eu";
    if (AFRICAN_COUNTRIES.includes(code)) return "africa";
    return "international"; // international fallback
  }, [user?.address?.countryCode]);

  // --- Shared ---
  const [loading, setLoading] = useState(false);
  const [manualAccountName, setManualAccountName] = useState("");
  const [manualBankName, setManualBankName] = useState("");

  // --- Africa ---
  const [selectedBank, setSelectedBank] = useState<BankType | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<BankBranchType | null>(
    null,
  );
  const [accountNumber, setAccountNumber] = useState("");
  const [validatedAccount, setValidatedAccount] =
    useState<ValidatedAccount | null>(null);

  // --- UK ---
  const [sortCode, setSortCode] = useState("");

  // --- US ---
  const [routingNumber, setRoutingNumber] = useState("");

  // --- EU ---
  const [iban, setIban] = useState("");
  const [swiftCode, setSwiftCode] = useState("");

  // --- Derived ---
  const showBranches = useMemo(
    () =>
      Boolean(
        regionType === "africa" &&
        user?.address?.countryCode &&
        selectedBank !== null &&
        COUNTRIES_WITH_BANK_BRANCHES.includes(user.address.countryCode),
      ),
    [user, selectedBank, regionType],
  );

  /**
   * Current step (0-indexed, 0 = Region, 1 = Details, 2 = Verify/Review, 3 = Link)
   * Used by StepIndicator to highlight the active step.
   */
  const currentStepIndex = useMemo<number>(() => {
    if (regionType === "africa") {
      if (validatedAccount?.isValidated) return 2;
      if (selectedBank && accountNumber) return 1;
      return 0;
    }
    if (regionType === "uk") {
      if (accountNumber && sortCode && manualAccountName) return 2;
      if (accountNumber || sortCode || manualAccountName) return 1;
    }
    if (regionType === "us") {
      if (accountNumber && routingNumber && manualAccountName) return 2;
      if (accountNumber || routingNumber || manualAccountName) return 1;
    }
    if (regionType === "eu") {
      if (iban && swiftCode && manualAccountName) return 2;
      if (iban || swiftCode || manualAccountName) return 1;
    }
    return 1;
  }, [
    regionType,
    validatedAccount,
    selectedBank,
    accountNumber,
    sortCode,
    routingNumber,
    iban,
    swiftCode,
    manualAccountName,
  ]);

  const steps: Step[] = useMemo(
    () =>
      [0, 1, 2, 3].map((i) => {
        const meta = resolveStepLabel(i, regionType);
        let status: StepStatus = "upcoming";
        if (i < currentStepIndex) status = "complete";
        else if (i === currentStepIndex) status = "active";
        return { index: i, ...meta, status };
      }),
    [regionType, currentStepIndex],
  );

  // --- Handlers ---
  const handleReset = useCallback(() => {
    setSelectedBank(null);
    setSelectedBranch(null);
    setAccountNumber("");
    setSortCode("");
    setRoutingNumber("");
    setIban("");
    setSwiftCode("");
    setManualAccountName("");
    setManualBankName("");
    setValidatedAccount(null);
    toast.info("Form cleared");
  }, []);

  const handleBankChange = useCallback((val: BankType) => {
    setSelectedBank(val);
    setSelectedBranch(null);
    setValidatedAccount(null);
  }, []);

  const handleAccountNumberChange = useCallback((val: string) => {
    setAccountNumber(val);
    setValidatedAccount(null);
  }, []);

  const handleValidateAccount = useCallback(async () => {
    if (!user) {
      toast_notif("User profile is still loading.", "error");
      return;
    }
    if (regionType !== "africa") return;
    if (!selectedBank || !accountNumber) {
      toast_notif("Bank and Account Number are required.", "error");
      return;
    }
    try {
      setLoading(true);
      const response = await validateBankAccount(
        selectedBank.code,
        accountNumber,
        csrf || "",
      );
      if (!response?.isOk) {
        toast_notif(response?.message || "Could not validate account", "error");
        return;
      }
      setValidatedAccount({ isValidated: true, ...response.data });
      toast.success("Account verified", {
        description: `Account Name: ${response.data.account_name}`,
      });
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      rollbar.error(err);
      toast_notif("System error, please try again later", "error");
    } finally {
      setLoading(false);
    }
  }, [regionType, selectedBank, accountNumber, csrf, rollbar, user]);

  const handleAddPrimaryAccount = useCallback(async () => {
    if (!user) {
      toast_notif("User profile is still loading.", "error");
      return;
    }

    // Validation guards
    if (regionType === "africa" && (!selectedBank || !validatedAccount)) {
      toast_notif("Please validate your account before proceeding.", "error");
      return;
    }
    if (regionType === "africa" && showBranches && !selectedBranch) {
      toast_notif("Please select a bank branch before proceeding.", "error");
      return;
    }
    if (
      regionType === "uk" &&
      (!accountNumber || !sortCode || !manualAccountName)
    ) {
      toast_notif(
        "Please fill in all required fields for your UK account.",
        "error",
      );
      return;
    }
    if (
      regionType === "us" &&
      (!accountNumber || !routingNumber || !manualAccountName)
    ) {
      toast_notif(
        "Please fill in all required fields for your US account.",
        "error",
      );
      return;
    }
    if (regionType === "eu" && (!iban || !swiftCode || !manualAccountName)) {
      toast_notif(
        "Please fill in all required fields for your account.",
        "error",
      );
      return;
    }
    if (
      regionType === "uk" &&
      !ValidationUtils.isValidUKBankDetails(accountNumber, sortCode)
    ) {
      toast_notif("Invalid UK Account Number or Sort Code", "error");
      return;
    }
    if (regionType === "us" && !/^\d{9}$/.test(routingNumber)) {
      toast_notif("US Routing Number must be exactly 9 digits.", "error");
      return;
    }
    if (regionType === "eu" && !ValidationUtils.isValidIBAN(iban)) {
      toast_notif(
        "The IBAN provided is invalid. Please check for typos.",
        "error",
      );
      return;
    }

    try {
      setLoading(true);

      let account_details: any;

      if (regionType === "africa" && selectedBank && validatedAccount) {
        account_details = {
          type: "africa",
          account_number: validatedAccount.account_number,
          bank_name: selectedBank.name,
          account_name: validatedAccount.account_name,
          bank_id: selectedBank.id,
          bank_code: selectedBank.code,
          branch: selectedBranch,
          bank_country: user.address.countryCode,
        };
      } else if (regionType === "uk") {
        account_details = {
          type: "uk",
          account_number: accountNumber,
          sort_code: sortCode,
          bank_name: manualBankName || "UK Bank",
          account_name: manualAccountName,
          bank_country: user.address.countryCode,
        };
      } else if (regionType === "us") {
        account_details = {
          type: "us",
          account_number: accountNumber,
          routing_number: routingNumber,
          bank_name: manualBankName || "US Bank",
          account_name: manualAccountName,
          bank_country: "US",
        };
      } else if (regionType === "eu") {
        account_details = {
          type: "eu",
          iban,
          swift_code: swiftCode,
          bank_name: manualBankName || "EU Bank",
          account_name: manualAccountName,
          bank_country: user.address.countryCode,
        };
      }

      const response = await addPrimaryAccount({
        owner_id: artist.artist_id,
        account_details,
        base_currency: user.base_currency,
        token: csrf || "",
      });

      if (!response?.isOk) {
        toast_notif(response.message, "error");
        return;
      }

      toast_notif(response.message, "success");
      await queryClient.invalidateQueries({
        queryKey: ["fetch_wallet_screen"],
      });
      router.replace("/artist/app/wallet");
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      rollbar.error(err);
      toast_notif("Failed to save account details.", "error");
    } finally {
      setLoading(false);
    }
  }, [
    regionType,
    selectedBank,
    validatedAccount,
    showBranches,
    selectedBranch,
    accountNumber,
    sortCode,
    manualAccountName,
    routingNumber,
    iban,
    swiftCode,
    manualBankName,
    csrf,
    user,
    queryClient,
    router,
    rollbar,
  ]);

  // --- Derived flags for FormActions ---
  const canSubmit = useMemo(() => {
    if (regionType === "uk")
      return !!(accountNumber && sortCode && manualAccountName);
    if (regionType === "us")
      return !!(accountNumber && routingNumber && manualAccountName);
    if (regionType === "eu") return !!(iban && swiftCode && manualAccountName);
    // africa: handled by validate button condition
    return true;
  }, [
    regionType,
    accountNumber,
    sortCode,
    routingNumber,
    iban,
    swiftCode,
    manualAccountName,
  ]);

  const canValidate = useMemo(() => {
    if (regionType !== "africa") return false;
    return !!(
      accountNumber &&
      selectedBank &&
      (!showBranches || selectedBranch)
    );
  }, [regionType, accountNumber, selectedBank, showBranches, selectedBranch]);

  return {
    // user & fetch state
    user,
    isFetchingUser,
    // region
    regionType,
    country: user.address.country,
    // shared
    loading,
    manualAccountName,
    setManualAccountName,
    manualBankName,
    setManualBankName,
    // africa
    selectedBank,
    handleBankChange,
    selectedBranch,
    setSelectedBranch,
    accountNumber,
    handleAccountNumberChange,
    validatedAccount,
    showBranches,
    // uk
    sortCode,
    setSortCode,
    // us
    routingNumber,
    setRoutingNumber,
    // eu
    iban,
    setIban,
    swiftCode,
    setSwiftCode,
    // handlers
    handleReset,
    handleValidateAccount,
    handleAddPrimaryAccount,
    // step indicator
    steps,
    currentStepIndex,
    // derived
    canSubmit,
    canValidate,
  };
}
