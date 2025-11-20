"use client";
import {
  BankBranchType,
  BankType,
  WithdrawalAccount,
} from "@omenai/shared-types";
import { SearchableSelect } from "./SearchableComboBox";
import { Button, TextInput } from "@mantine/core";
import { useState, useCallback, useMemo } from "react";
import { validateBankAccount } from "@omenai/shared-services/wallet/validateAccount";
import { addPrimaryAccount } from "@omenai/shared-services/wallet/addPrimaryAccount";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import React from "react";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { useRollbar } from "@rollbar/react";

// Move constants outside component to prevent recreation
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

const TOAST_ERROR_STYLE = {
  background: "red",
  color: "white",
};

const TOAST_SUCCESS_STYLE = {
  background: "green",
  color: "white",
};

export default function AccountForm() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { user, csrf } = useAuth({ requiredRole: "artist" });
  const rollbar = useRollbar();

  const [selectedBank, setSelectedBank] = useState<BankType | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<BankBranchType | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [account_number, set_account_number] = useState("");
  const [validatedAccount, setValidatedAccount] = useState<{
    isValidated: boolean;
    account_name: string;
    account_number: string;
  }>({ isValidated: false, account_name: "", account_number: "" });

  // Memoize whether to show branches
  const showBranches = useMemo(() => {
    return (
      user &&
      selectedBank !== null &&
      COUNTRIES_WITH_BANK_BRANCHES.includes(user.address.countryCode)
    );
  }, [user, selectedBank]);

  // Memoize bank code for branches
  const bankCodeForBranches = useMemo(() => {
    return selectedBank !== null ? selectedBank.id.toString() : "";
  }, [selectedBank]);

  // Memoize validation button disabled state
  const isValidationDisabled = useMemo(() => {
    return !account_number || selectedBank === null;
  }, [account_number, selectedBank]);

  // Optimize handleSelectOption with useCallback
  const handleSelectOption = useCallback(
    (type: "banks" | "branches", value: BankType | BankBranchType) => {
      if (type === "banks") {
        setSelectedBank(value as BankType);
        // Reset branch when bank changes
        setSelectedBranch(null);
      }
      if (type === "branches") {
        setSelectedBranch(value as BankBranchType);
      }
    },
    []
  );

  // Optimize account number change handler
  const handleAccountNumberChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      set_account_number(event.currentTarget.value);
    },
    []
  );

  const handleValidateAccount = useCallback(async () => {
    if (selectedBank === null || !account_number) {
      toast.error("Error Notification", {
        description: "Account number and bank is required",
        style: TOAST_ERROR_STYLE,
        className: "class",
      });
      return;
    }

    try {
      setLoading(true);

      const validateBankAccountResponse = await validateBankAccount(
        selectedBank.code,
        account_number,
        csrf || ""
      );

      if (
        validateBankAccountResponse === undefined ||
        !validateBankAccountResponse.isOk
      ) {
        toast.error("Error Notification", {
          description: validateBankAccountResponse?.message,
          style: TOAST_ERROR_STYLE,
          className: "class",
        });
        return;
      }

      setValidatedAccount({
        isValidated: true,
        ...validateBankAccountResponse.data,
      });
    } catch (error) {
      if (error instanceof Error) {
        rollbar.error(error);
      } else {
        rollbar.error(new Error(String(error)));
      }
      toast.error("Error Notification", {
        description:
          "An error has occurred. Please try again or contact support",
        style: TOAST_ERROR_STYLE,
        className: "class",
      });
    } finally {
      setLoading(false);
    }
  }, [selectedBank, account_number, csrf]);

  const handleAddPrimaryAccount = useCallback(async () => {
    if (selectedBank === null || account_number.length === 0) {
      toast.error("Error Notification", {
        description: "Account number and bank is required",
        style: TOAST_ERROR_STYLE,
        className: "class",
      });
      return;
    }

    try {
      setLoading(true);

      const account_details: Omit<WithdrawalAccount, "beneficiary_id"> = {
        account_number: validatedAccount.account_number,
        bank_name: selectedBank.name,
        account_name: validatedAccount.account_name,
        bank_id: selectedBank.id,
        bank_code: selectedBank.code,
        branch: selectedBranch,
        bank_country: user.address.countryCode,
      };

      const add_primary_account_response = await addPrimaryAccount({
        owner_id: user.artist_id,
        account_details,
        base_currency: user.base_currency,
        token: csrf || "",
      });

      if (
        add_primary_account_response === undefined ||
        !add_primary_account_response.isOk
      ) {
        toast.error("Error Notification", {
          description: add_primary_account_response?.message,
          style: TOAST_ERROR_STYLE,
          className: "class",
        });
        return;
      }

      toast.success("Operation successful", {
        description: add_primary_account_response.message,
        style: TOAST_SUCCESS_STYLE,
        className: "class",
      });

      await queryClient.invalidateQueries({
        queryKey: ["fetch_wallet_screen"],
      });

      router.replace("/artist/app/wallet");
    } catch (error) {
      if (error instanceof Error) {
        rollbar.error(error);
      } else {
        rollbar.error(new Error(String(error)));
      }
      toast.error("Error Notification", {
        description:
          "An error has occurred. Please try again or contact support",
        style: TOAST_ERROR_STYLE,
        className: "class",
      });
    } finally {
      setLoading(false);
    }
  }, [
    selectedBank,
    account_number,
    validatedAccount,
    selectedBranch,
    user,
    csrf,
    queryClient,
    router,
  ]);

  return (
    <form className="flex flex-col space-y-6">
      <TextInput
        label="Country"
        placeholder="Input placeholder"
        value={user.address.country}
        disabled
        className="font-normal"
      />

      <SearchableSelect
        type="banks"
        setSelect={handleSelectOption}
        disabled={validatedAccount.isValidated}
      />

      {showBranches && (
        <SearchableSelect
          type="branches"
          setSelect={handleSelectOption}
          disabled={selectedBank === null || validatedAccount.isValidated}
          bankCode={bankCodeForBranches}
        />
      )}

      <TextInput
        label="Account number"
        placeholder="Enter your bank account number"
        className="font-normal"
        withAsterisk
        onChange={handleAccountNumberChange}
        disabled={validatedAccount.isValidated}
      />

      <TextInput
        label="Account name"
        placeholder="Your account name will be automatically displayed here"
        className="font-normal"
        withAsterisk
        readOnly
        disabled
        value={validatedAccount.account_name}
      />

      {!validatedAccount.isValidated ? (
        <Button
          onClick={handleValidateAccount}
          variant="filled"
          color="#0f172a"
          fullWidth
          loading={loading}
          disabled={isValidationDisabled}
          className="font-light"
        >
          Validate account
        </Button>
      ) : (
        <Button
          onClick={handleAddPrimaryAccount}
          variant="filled"
          color="#0f172a"
          fullWidth
          loading={loading}
          className="font-light"
        >
          Add primary account
        </Button>
      )}
    </form>
  );
}
