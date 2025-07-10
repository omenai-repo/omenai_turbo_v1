"use client";
import {
  BankBranchType,
  BankType,
  WithdrawalAccount,
} from "@omenai/shared-types";
import { SearchableSelect } from "./SearchableComboBox";
import { Button, TextInput } from "@mantine/core";
import { useState } from "react";
import { validateBankAccount } from "@omenai/shared-services/wallet/validateAccount";
import { addPrimaryAccount } from "@omenai/shared-services/wallet/addPrimaryAccount";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import React from "react";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
export default function AccountForm() {
  const queryClient = useQueryClient();
  const { user, csrf } = useAuth({ requiredRole: "artist" });
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

  const countries_with_bank_branches = [
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

  const router = useRouter();
  const showBranches = () => {
    if (
      user &&
      selectedBank !== null &&
      countries_with_bank_branches.includes(user.address.countryCode)
    ) {
      return true;
    }
    return false;
  };

  const handleSelectOption = (
    type: "banks" | "branches",
    value: BankType | BankBranchType
  ) => {
    if (type === "banks") setSelectedBank(value as BankType);
    if (type === "branches") setSelectedBranch(value as BankBranchType);
  };

  const handleValidateAccount = async () => {
    try {
      setLoading(true);
      if (selectedBank === null || !account_number) {
        toast.error("Error Notification", {
          description: "Account number and bank is required",
          style: {
            background: "red",
            color: "white",
          },
          className: "class",
        });
        return;
      }
      const validateBankAccountResponse = await validateBankAccount(
        // TODO: Change this to selectedBank.code
        "044",
        account_number,
        csrf || ""
      );

      if (
        validateBankAccountResponse === undefined ||
        !validateBankAccountResponse.isOk
      ) {
        toast.error("Error Notification", {
          description: validateBankAccountResponse?.message,
          style: {
            background: "red",
            color: "white",
          },
          className: "class",
        });
        return;
      }
      setValidatedAccount({
        isValidated: true,
        ...validateBankAccountResponse.data,
      });
    } catch (error) {
      toast.error("Error Notification", {
        description:
          "An error has occured, Please try again or contact suppport",
        style: {
          background: "red",
          color: "white",
        },
        className: "class",
      });
    } finally {
      setLoading(false);
      //   set_account_number("");
      //   setSelectedBank(null);
      //   setValidatedAccount({
      //     isValidated: false,
      //     account_name: "",
      //     account_number: "",
      //   });
    }
  };

  const handleAddPrimaryAccount = async () => {
    console.log(account_number, selectedBank);
    try {
      setLoading(true);
      if (selectedBank === null || account_number.length === 0) {
        toast.error("Error Notification", {
          description: "Account number and bank is required",
          style: {
            background: "red",
            color: "white",
          },
          className: "class",
        });
        return;
      }
      const account_details: Omit<WithdrawalAccount, "beneficiary_id"> = {
        account_number: Number(validatedAccount.account_number),
        bank_name: selectedBank.name,
        account_name: validatedAccount.account_name,
        bank_id: selectedBank.id,
        bank_code: "044", // TODO: Change to appropriate bank code
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
          style: {
            background: "red",
            color: "white",
          },
          className: "class",
        });
        return;
      }
      toast.error("Operation successful", {
        description: add_primary_account_response.message,
        style: {
          background: "green",
          color: "white",
        },
        className: "class",
      });
      await queryClient.invalidateQueries({
        queryKey: ["fetch_wallet_screen"],
      });
      router.replace("/artist/app/wallet");
    } catch (error) {
      toast.error("Error Notification", {
        description:
          "An error has occured. Please try again or contact support",
        style: {
          background: "red",
          color: "white",
        },
        className: "class",
      });
    } finally {
      setLoading(false);
    }
  };
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
        disabled={false || validatedAccount.isValidated}
      />
      {showBranches() && (
        <SearchableSelect
          type="branches"
          setSelect={handleSelectOption}
          disabled={selectedBank === null || validatedAccount.isValidated}
          bankCode={selectedBank !== null ? selectedBank.id.toString() : ""}
        />
      )}

      <TextInput
        label="Account number"
        placeholder="Enter your bank account number"
        className="font-normal"
        withAsterisk
        onChange={(event) => set_account_number(event.currentTarget.value)}
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
        <>
          <Button
            onClick={handleValidateAccount}
            variant="filled"
            color="#1a1a1a"
            fullWidth
            loading={loading}
            disabled={!account_number || selectedBank === null}
            className="font-light"
          >
            Validate account
          </Button>
        </>
      ) : (
        <>
          <Button
            onClick={handleAddPrimaryAccount}
            variant="filled"
            color="#1a1a1a"
            fullWidth
            loading={loading}
            className="font-light"
          >
            Add primary account
          </Button>
        </>
      )}
    </form>
  );
}
