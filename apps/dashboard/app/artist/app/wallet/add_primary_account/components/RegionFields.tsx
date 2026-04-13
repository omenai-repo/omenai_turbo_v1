"use client";

/**
 * Region-specific field groups for UK, US, and EU accounts.
 * Each exports a focused, minimal component using FormField.
 */

import React from "react";
import { FormField } from "./FormField";

// ---------------------------------------------------------------------------
// UKFields
// ---------------------------------------------------------------------------

interface UKFieldsProps {
  accountName: string;
  onAccountNameChange: (v: string) => void;
  bankName: string;
  onBankNameChange: (v: string) => void;
  accountNumber: string;
  onAccountNumberChange: (v: string) => void;
  sortCode: string;
  onSortCodeChange: (v: string) => void;
}

export function UKFields({
  accountName,
  onAccountNameChange,
  bankName,
  onBankNameChange,
  accountNumber,
  onAccountNumberChange,
  sortCode,
  onSortCodeChange,
}: UKFieldsProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <FormField
        label="Account Holder Name"
        placeholder="Jane Doe"
        value={accountName}
        onChange={onAccountNameChange}
        required
        autoComplete="name"
      />
      <FormField
        label="Bank Name"
        placeholder="e.g. Barclays, Monzo"
        value={bankName}
        onChange={onBankNameChange}
        description="Optional"
      />
      <FormField
        label="Account Number"
        placeholder="8-digit account number"
        value={accountNumber}
        onChange={onAccountNumberChange}
        required
        maxLength={8}
        autoComplete="off"
      />
      <FormField
        label="Sort Code"
        placeholder="12-34-56"
        value={sortCode}
        onChange={onSortCodeChange}
        required
        maxLength={8}
        autoComplete="off"
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// USFields
// ---------------------------------------------------------------------------

interface USFieldsProps {
  accountName: string;
  onAccountNameChange: (v: string) => void;
  bankName: string;
  onBankNameChange: (v: string) => void;
  accountNumber: string;
  onAccountNumberChange: (v: string) => void;
  routingNumber: string;
  onRoutingNumberChange: (v: string) => void;
}

export function USFields({
  accountName,
  onAccountNameChange,
  bankName,
  onBankNameChange,
  accountNumber,
  onAccountNumberChange,
  routingNumber,
  onRoutingNumberChange,
}: USFieldsProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <FormField
        label="Account Holder Name"
        placeholder="Jane Doe"
        value={accountName}
        onChange={onAccountNameChange}
        required
        autoComplete="name"
      />
      <FormField
        label="Bank Name"
        placeholder="e.g. Chase, Bank of America"
        value={bankName}
        onChange={onBankNameChange}
        description="Optional"
      />
      <FormField
        label="Account Number"
        placeholder="Bank account number"
        value={accountNumber}
        onChange={onAccountNumberChange}
        required
        autoComplete="off"
      />
      <FormField
        label="Routing Number (ABA)"
        placeholder="9-digit routing number"
        value={routingNumber}
        onChange={onRoutingNumberChange}
        required
        maxLength={9}
        autoComplete="off"
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// EUFields
// ---------------------------------------------------------------------------

interface EUFieldsProps {
  accountName: string;
  onAccountNameChange: (v: string) => void;
  bankName: string;
  onBankNameChange: (v: string) => void;
  iban: string;
  onIbanChange: (v: string) => void;
  swiftCode: string;
  onSwiftCodeChange: (v: string) => void;
}

export function EUFields({
  accountName,
  onAccountNameChange,
  bankName,
  onBankNameChange,
  iban,
  onIbanChange,
  swiftCode,
  onSwiftCodeChange,
}: EUFieldsProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <FormField
        label="Account Holder Name"
        placeholder="Jane Doe"
        value={accountName}
        onChange={onAccountNameChange}
        required
        autoComplete="name"
      />
      <FormField
        label="Bank Name"
        placeholder="e.g. Santander, BNP Paribas"
        value={bankName}
        onChange={onBankNameChange}
        description="Optional"
      />
      <FormField
        label="IBAN"
        placeholder="International Bank Account Number"
        value={iban}
        onChange={(v) => onIbanChange(v.toUpperCase())}
        required
        autoComplete="off"
      />
      <FormField
        label="SWIFT / BIC Code"
        placeholder="8 or 11-character code"
        value={swiftCode}
        onChange={(v) => onSwiftCodeChange(v.toUpperCase())}
        required
        maxLength={11}
        autoComplete="off"
      />
    </div>
  );
}
