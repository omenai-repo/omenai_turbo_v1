"use client";

/**
 * AfricaFields — Form fields for African bank account entry.
 * Includes: bank selector, optional branch selector, account number input,
 * and the VerifiedBadge on successful validation.
 */

import React from "react";
import { BankBranchType, BankType } from "@omenai/shared-types";
import { FormField } from "./FormField";
import { VerifiedBadge } from "./VerifiedBadge";
import { ValidatedAccount } from "@omenai/shared-hooks/hooks/useAccountForm";
import { SearchableSelect } from "./SearchableComboBox";

interface AfricaFieldsProps {
  selectedBank: BankType | null;
  onBankChange: (val: BankType) => void;
  selectedBranch: BankBranchType | null;
  onBranchChange: (val: BankBranchType) => void;
  showBranches: boolean;
  accountNumber: string;
  onAccountNumberChange: (val: string) => void;
  validatedAccount: ValidatedAccount | null;
  countryCode: string;
}

export function AfricaFields({
  selectedBank,
  onBankChange,
  selectedBranch,
  onBranchChange,
  showBranches,
  accountNumber,
  onAccountNumberChange,
  validatedAccount,
  countryCode,
}: AfricaFieldsProps) {
  const isValidated = !!validatedAccount?.isValidated;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Bank selector */}
      <SearchableSelect
        type="banks"
        selectedItem={selectedBank}
        onChange={(val) => onBankChange(val as BankType)}
        disabled={isValidated}
        countryCode={countryCode}
      />

      {/* Branch selector (only for specific countries) */}
      {showBranches && (
        <SearchableSelect
          countryCode={countryCode}
          type="branches"
          selectedItem={selectedBranch}
          onChange={(val) => onBranchChange(val as BankBranchType)}
          bankCode={selectedBank ? String(selectedBank.id) : ""}
          disabled={!selectedBank || isValidated}
        />
      )}

      {/* Account number */}
      <FormField
        label="Account Number"
        placeholder="0000000000"
        value={accountNumber}
        onChange={onAccountNumberChange}
        disabled={isValidated}
        required
      />

      {/* Verified account result */}
      {isValidated && validatedAccount && (
        <VerifiedBadge
          accountName={validatedAccount.account_name}
          accountNumber={validatedAccount.account_number}
        />
      )}
    </div>
  );
}
