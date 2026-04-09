"use client";

import React, { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useRollbar } from "@rollbar/react";
import { toast } from "sonner";
import {
  Button,
  TextInput,
  Title,
  Text,
  Group,
  ActionIcon,
  Tooltip,
  ThemeIcon,
  Badge,
} from "@mantine/core";

import {
  BankBranchType,
  BankType,
  WithdrawalAccount,
} from "@omenai/shared-types";
import { validateBankAccount } from "@omenai/shared-services/wallet/validateAccount";
import { addPrimaryAccount } from "@omenai/shared-services/wallet/addPrimaryAccount";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";

import { SearchableSelect } from "./SearchableComboBox";
import {
  Building,
  Check,
  CheckCircle2,
  Landmark,
  RefreshCcw,
  Shield,
  ShieldClose,
} from "lucide-react";
import { toast_notif } from "@omenai/shared-utils/src/toast_notification";
import { ValidationUtils } from "../validator";

const COUNTRIES_WITH_BANK_BRANCHES = [
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

// List of African countries supported by Flutterwave's legacy bank endpoints
const AFRICAN_COUNTRIES = [
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

// List of ALL SEPA countries (Euro & Non-Euro)
const SEPA_COUNTRY_CODES = [
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

export default function AccountForm() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const rollbar = useRollbar();
  const { user, csrf } = useAuth({ requiredRole: "artist" });

  // --- Determine Region Type ---
  const regionType = useMemo<"africa" | "uk" | "eu">(() => {
    const code = user.address.countryCode?.toUpperCase() || "";
    if (code === "GB") return "uk";
    if (SEPA_COUNTRY_CODES.includes(code)) return "eu";
    if (AFRICAN_COUNTRIES.includes(code)) return "africa";

    // Default fallback to international IBAN/SWIFT form for any unlisted countries
    return "eu";
  }, [user.address.countryCode]);

  // --- Shared State ---
  const [loading, setLoading] = useState(false);
  const [manualAccountName, setManualAccountName] = useState("");
  const [manualBankName, setManualBankName] = useState("");

  // --- Africa State ---
  const [selectedBank, setSelectedBank] = useState<BankType | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<BankBranchType | null>(
    null,
  );
  const [accountNumber, setAccountNumber] = useState("");
  const [validatedAccount, setValidatedAccount] = useState<{
    isValidated: boolean;
    account_name: string;
    account_number: string;
  } | null>(null);

  // --- UK State ---
  const [sortCode, setSortCode] = useState("");

  // --- EU State ---
  const [iban, setIban] = useState("");
  const [swiftCode, setSwiftCode] = useState("");

  // --- Derived State ---
  const showBranches = useMemo(() => {
    return Boolean(
      // <-- Force this to return true/false
      regionType === "africa" &&
      user.address.countryCode &&
      selectedBank !== null &&
      COUNTRIES_WITH_BANK_BRANCHES.includes(user.address.countryCode),
    );
  }, [user, selectedBank, regionType]);

  // --- Handlers ---
  const handleReset = useCallback(() => {
    setSelectedBank(null);
    setSelectedBranch(null);
    setAccountNumber("");
    setSortCode("");
    setIban("");
    setSwiftCode("");
    setManualAccountName("");
    setManualBankName("");
    setValidatedAccount(null);
    toast.info("Form reset", { description: "Fields have been cleared." });
  }, []);

  const handleValidateAccount = async () => {
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

      setValidatedAccount({
        isValidated: true,
        ...response.data,
      });
      toast.success("Account Verified", {
        description: `Account Name: ${response.data.account_name}`,
      });
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      rollbar.error(err);
      toast_notif("System error, please try again later", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAddPrimaryAccount = async () => {
    if (regionType === "africa" && (!selectedBank || !validatedAccount)) {
      toast_notif("Please validate your account before proceeding.", "error");
      return;
    }

    // Extra safety guard: Force branch selection if the country requires it
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

    if (regionType === "eu" && (!iban || !swiftCode || !manualAccountName)) {
      toast_notif(
        "Please fill in all required fields for your account.",
        "error",
      );
      return;
    }

    if (regionType === "uk") {
      if (!ValidationUtils.isValidUKBankDetails(accountNumber, sortCode)) {
        toast_notif("Invalid UK Account Number or Sort Code", "error");
        return;
      }
    }

    if (regionType === "eu") {
      if (!ValidationUtils.isValidIBAN(iban)) {
        toast_notif(
          "The IBAN provided is invalid. Please check for typos.",
          "error",
        );
        return;
      }
    }

    try {
      setLoading(true);

      let account_details: any; // Build payload based on our Discriminated Union Type

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
      } else if (regionType === "eu") {
        account_details = {
          type: "eu",
          iban: iban,
          swift_code: swiftCode,
          bank_name: manualBankName || "EU Bank",
          account_name: manualAccountName,
          bank_country: user.address.countryCode,
        };
      }

      const response = await addPrimaryAccount({
        owner_id: user.artist_id,
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
  };

  return (
    <div className="min-h-auto w-full flex bg-slate-50 overflow-hidden">
      {/* LEFT SIDE: Form Area */}
      <div className="w-full lg:w-5/12 xl:w-1/3 flex flex-col justify-center px-8 lg:px-12 py-8 bg-white shadow-xl z-10 overflow-y-auto">
        <div className="max-w-md mx-auto w-full space-y-8">
          <div>
            <Group justify="space-between" align="start">
              <ThemeIcon size={24} radius="md" variant="light" color="blue">
                <Building size={28} />
              </ThemeIcon>

              <Tooltip label="Reset Form">
                <ActionIcon
                  variant="subtle"
                  color="slate"
                  onClick={handleReset}
                  size="lg"
                >
                  <RefreshCcw size={20} />
                </ActionIcon>
              </Tooltip>
            </Group>

            <Title size={"md"} order={2} className="py-3 text-slate-900">
              Connect Bank Account
            </Title>
            <Text c="dimmed" size="xs" className="mt-2">
              Link your primary bank account to receive payouts securely.
            </Text>
          </div>

          <form className="flex flex-col space-y-2">
            <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded mb-2">
              <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-slate-700 border border-slate-200">
                <Landmark size={20} />
              </div>
              <div>
                <Text
                  size="xs"
                  c="dimmed"
                  fw={500}
                  tt="uppercase"
                  className="tracking-wider"
                >
                  Your Region/Country
                </Text>
                <Text
                  size="sm"
                  fw={600}
                  c="slate.9"
                  className="flex items-center gap-2"
                >
                  {user.address.country}
                  <CheckCircle2 size={14} className="text-green-500" />
                </Text>
              </div>
            </div>

            {/* --- AFRICA SPECIFIC FIELDS --- */}
            {regionType === "africa" && (
              <>
                <SearchableSelect
                  type="banks"
                  selectedItem={selectedBank}
                  onChange={(val) => {
                    setSelectedBank(val as BankType);
                    setSelectedBranch(null);
                    setValidatedAccount(null);
                  }}
                  disabled={!!validatedAccount?.isValidated}
                />

                {showBranches && (
                  <SearchableSelect
                    type="branches"
                    selectedItem={selectedBranch}
                    onChange={(val) => setSelectedBranch(val as BankBranchType)}
                    bankCode={selectedBank ? String(selectedBank.id) : ""}
                    disabled={!selectedBank || !!validatedAccount?.isValidated}
                  />
                )}

                <TextInput
                  label="Account Number"
                  placeholder="0000000000"
                  value={accountNumber}
                  onChange={(e) => {
                    setAccountNumber(e.currentTarget.value);
                    setValidatedAccount(null);
                  }}
                  disabled={!!validatedAccount?.isValidated}
                  size="sm"
                  withAsterisk
                />

                {validatedAccount?.isValidated && (
                  <div className="p-4 bg-green-50 border border-green-100 rounded-lg animate-in fade-in slide-in-from-bottom-2">
                    <Text
                      size="xs"
                      c="green.8"
                      fw={500}
                      tt="uppercase"
                      className="mb-1"
                    >
                      Verified Account Name
                    </Text>
                    <Text size="sm" fw={700} c="green.9">
                      {validatedAccount.account_name}
                    </Text>
                  </div>
                )}
              </>
            )}

            {/* --- UK SPECIFIC FIELDS --- */}
            {regionType === "uk" && (
              <>
                <TextInput
                  label="Account Holder Name"
                  placeholder="Jane Doe"
                  value={manualAccountName}
                  onChange={(e) => setManualAccountName(e.currentTarget.value)}
                  size="sm"
                  withAsterisk
                />
                <TextInput
                  label="Bank Name"
                  placeholder="e.g. Barclays, Monzo"
                  value={manualBankName}
                  onChange={(e) => setManualBankName(e.currentTarget.value)}
                  size="sm"
                  withAsterisk
                />
                <TextInput
                  label="Account Number"
                  placeholder="8 Digit Account Number"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.currentTarget.value)}
                  size="sm"
                  withAsterisk
                />
                <TextInput
                  label="Sort Code"
                  placeholder="123456 or 12-34-56"
                  value={sortCode}
                  onChange={(e) => setSortCode(e.currentTarget.value)}
                  size="sm"
                  withAsterisk
                />
              </>
            )}

            {/* --- EU / SEPA SPECIFIC FIELDS --- */}
            {regionType === "eu" && (
              <>
                <TextInput
                  label="Account Holder Name"
                  placeholder="Jane Doe"
                  value={manualAccountName}
                  onChange={(e) => setManualAccountName(e.currentTarget.value)}
                  size="sm"
                  withAsterisk
                />
                <TextInput
                  label="Bank Name"
                  placeholder="e.g. Santander, BNP Paribas"
                  value={manualBankName}
                  onChange={(e) => setManualBankName(e.currentTarget.value)}
                  size="sm"
                  withAsterisk
                />
                <TextInput
                  label="IBAN"
                  placeholder="International Bank Account Number"
                  value={iban}
                  onChange={(e) => setIban(e.currentTarget.value.toUpperCase())}
                  size="sm"
                  withAsterisk
                />
                <TextInput
                  label="SWIFT / BIC Code"
                  placeholder="8 or 11 character code"
                  value={swiftCode}
                  onChange={(e) =>
                    setSwiftCode(e.currentTarget.value.toUpperCase())
                  }
                  size="sm"
                  withAsterisk
                />
              </>
            )}

            {/* --- ACTION BUTTONS --- */}
            <div className="pt-4">
              {regionType === "africa" && !validatedAccount?.isValidated ? (
                <Button
                  onClick={handleValidateAccount}
                  fullWidth
                  size="sm"
                  color="dark"
                  loading={loading}
                  disabled={
                    !accountNumber ||
                    !selectedBank ||
                    (showBranches && !selectedBranch)
                  }
                >
                  Validate Account
                </Button>
              ) : (
                <Button
                  onClick={handleAddPrimaryAccount}
                  fullWidth
                  size="sm"
                  color="dark"
                  loading={loading}
                  leftSection={<Shield size={18} />}
                  disabled={
                    (regionType === "uk" &&
                      (!accountNumber || !sortCode || !manualAccountName)) ||
                    (regionType === "eu" &&
                      (!iban || !swiftCode || !manualAccountName))
                  }
                >
                  Confirm & Link Account
                </Button>
              )}
            </div>
          </form>

          <div className="pt-6 border-t border-slate-100">
            <Group justify="center" gap="xs">
              <ShieldClose size={14} className="text-slate-400" />
              <Text size="xs" c="dimmed">
                Your banking information is encrypted and secure.
              </Text>
            </Group>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Visual/Decorative Area */}
      <div className="hidden lg:flex lg:w-7/12 xl:w-2/3 bg-slate-900 relative overflow-hidden items-center justify-center">
        {/* Abstract Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900" />
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-3xl" />

        {/* Content Card */}
        <div className="relative z-10 max-w-lg">
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 p-12 rounded-2xl shadow-2xl">
            <Badge variant="filled" color="blue" size="md" className="mb-6">
              Global Payouts Supported
            </Badge>
            <Title className="text-white text-5xl font-light mb-6 leading-tight">
              Seamless Wallet <br />
              <span className="font-bold text-blue-400">Payouts</span>
            </Title>
            <Text c={"white"} className="text-white text-md leading-relaxed">
              Connect your local bank account to receive funds directly in your
              currency. We support secure transfers globally, accommodating
              standard IBAN, Sort Codes, and local clearing routes.
            </Text>

            <div className="mt-10 flex gap-4">
              <div className="h-2 w-20 bg-blue-500 rounded-full" />
              <div className="h-2 w-4 bg-slate-600 rounded-full" />
              <div className="h-2 w-4 bg-slate-600 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
