"use client";

import React from "react";
import { RotateCcw } from "lucide-react";
import { useAccountForm } from "@omenai/shared-hooks/hooks/useAccountForm";
import { RegionBadge } from "./RegionBadge";
import { AfricaFields } from "./AfricaField";
import { EUFields, UKFields, USFields } from "./RegionFields";
import { FormActions } from "./FormActions";
import { StepIndicator } from "./StepIndicator";
import Load from "@omenai/shared-ui-components/components/loader/Load";

// ---------------------------------------------------------------------------
// Design tokens (inline — avoids Tailwind config changes for custom brand hues)
// ---------------------------------------------------------------------------

const C = {
  pageBg: "transparent", // A very clean, cool off-white so the pure white form pops
  formBg: "#ffffff", // Pure white
  sidebarBg: "#f3f4f6", // Crisp, light neutral gray
  border: "#e5e7eb", // Neutral cool-gray border
  navy: "#0f172a", // Deep slate/navy for sharp contrast
  textMuted: "#6b7280", // Neutral muted gray
  textLight: "#9ca3af", // Lighter neutral gray
  divider: "#e5e7eb", // Clean, subtle divider
  displayFont: "'Cormorant Garamond', Georgia, serif",
  bodyFont: "'DM Sans', system-ui, sans-serif",
  shadow: "0 1px 3px rgba(15,23,42,0.06), 0 8px 32px rgba(15,23,42,0.08)",
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function AccountForm() {
  const form = useAccountForm();

  if (form.isFetchingUser || !form.user) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#0B0F19]">
        <div className="flex flex-col items-center gap-4">
          {/* Replace this with your standard app spinner if you have one */}
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm animate-pulse">
            Loading secure routing...
          </p>
        </div>
      </div>
    );
  }

  const {
    user,
    regionType,
    isFetchingUser,
    loading,
    manualAccountName,
    setManualAccountName,
    manualBankName,
    setManualBankName,
    selectedBank,
    handleBankChange,
    selectedBranch,
    setSelectedBranch,
    accountNumber,
    handleAccountNumberChange,
    validatedAccount,
    showBranches,
    sortCode,
    setSortCode,
    routingNumber,
    setRoutingNumber,
    iban,
    setIban,
    swiftCode,
    setSwiftCode,
    handleReset,
    handleValidateAccount,
    handleAddPrimaryAccount,
    steps,
    canSubmit,
    canValidate,
  } = form;

  return (
    /* ── Page shell ─────────────────────────────────────────────────────── */
    <div
      style={{
        minHeight: "80vh",
        background: C.pageBg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "4px",
        fontFamily: C.bodyFont,
      }}
    >
      {/* ── Outer card ─────────────────────────────────────────────────── */}
      <div
        style={{
          width: "100%",
          maxWidth: "1600px",
          display: "grid",
          gridTemplateColumns: "1fr 300px",
          borderRadius: "10px",
          overflow: "hidden",
          boxShadow: C.shadow,
          border: `1px solid ${C.border}`,
        }}
      >
        {/* ── LEFT: Form panel ─────────────────────────────────────────── */}
        <div
          style={{
            background: C.formBg,
            padding: "40px 40px 36px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Header row */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              marginBottom: "28px",
            }}
          >
            <div>
              {/* Eyebrow */}
              <p
                style={{
                  margin: "0 0 8px 0",
                  fontSize: "11px",
                  fontWeight: 500,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: C.textLight,
                }}
              >
                Wallet Setup
              </p>

              {/* Title */}
              <h1
                style={{
                  margin: 0,
                  fontFamily: C.displayFont,
                  fontSize: "28px",
                  fontWeight: 500,
                  color: C.navy,
                  lineHeight: 1.2,
                  letterSpacing: "-0.01em",
                }}
              >
                Connect Bank Account
              </h1>

              {/* Subtitle */}
              <p
                style={{
                  margin: "6px 0 0 0",
                  fontSize: "13px",
                  color: C.textMuted,
                  lineHeight: 1.5,
                }}
              >
                Link your primary account to receive payouts directly.
              </p>
            </div>

            {/* Reset button */}
            <button
              type="button"
              onClick={handleReset}
              title="Reset form"
              style={{
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                gap: "5px",
                padding: "6px 12px",
                fontSize: "11px",
                fontWeight: 500,
                letterSpacing: "0.04em",
                color: C.textMuted,
                background: "transparent",
                border: `1px solid ${C.border}`,
                borderRadius: "6px",
                cursor: "pointer",
                transition: "all 0.15s ease",
                fontFamily: C.bodyFont,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color = C.navy;
                (e.currentTarget as HTMLButtonElement).style.borderColor =
                  C.navy;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color =
                  C.textMuted;
                (e.currentTarget as HTMLButtonElement).style.borderColor =
                  C.border;
              }}
            >
              <RotateCcw size={11} strokeWidth={2} />
              <span>Reset</span>
            </button>
          </div>

          {/* Divider */}
          <div
            style={{
              height: "1px",
              background: C.divider,
              marginBottom: "24px",
            }}
          />

          {/* Form body */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "24px",
              flex: 1,
            }}
          >
            {/* Region badge */}
            <RegionBadge
              country={user.address.country}
              regionType={regionType}
            />

            {/* Region-specific fields */}
            {regionType === "africa" && (
              <AfricaFields
                selectedBank={selectedBank}
                onBankChange={handleBankChange}
                selectedBranch={selectedBranch}
                onBranchChange={(v) => setSelectedBranch(v)}
                showBranches={showBranches}
                accountNumber={accountNumber}
                onAccountNumberChange={handleAccountNumberChange}
                validatedAccount={validatedAccount}
                countryCode={user.address.countryCode}
              />
            )}

            {regionType === "uk" && (
              <UKFields
                accountName={manualAccountName}
                onAccountNameChange={setManualAccountName}
                bankName={manualBankName}
                onBankNameChange={setManualBankName}
                accountNumber={accountNumber}
                onAccountNumberChange={handleAccountNumberChange}
                sortCode={sortCode}
                onSortCodeChange={setSortCode}
              />
            )}

            {regionType === "us" && (
              <USFields
                accountName={manualAccountName}
                onAccountNameChange={setManualAccountName}
                bankName={manualBankName}
                onBankNameChange={setManualBankName}
                accountNumber={accountNumber}
                onAccountNumberChange={handleAccountNumberChange}
                routingNumber={routingNumber}
                onRoutingNumberChange={setRoutingNumber}
              />
            )}

            {(regionType === "eu" || regionType === "international") && (
              <EUFields
                accountName={manualAccountName}
                onAccountNameChange={setManualAccountName}
                bankName={manualBankName}
                onBankNameChange={setManualBankName}
                iban={iban}
                onIbanChange={setIban}
                swiftCode={swiftCode}
                onSwiftCodeChange={setSwiftCode}
              />
            )}

            {/* Action button */}
            <FormActions
              regionType={regionType}
              isValidated={!!validatedAccount?.isValidated}
              loading={loading}
              canValidate={canValidate}
              canSubmit={canSubmit}
              onValidate={handleValidateAccount}
              onSubmit={handleAddPrimaryAccount}
            />
          </div>
        </div>

        {/* ── RIGHT: Step indicator panel ──────────────────────────────── */}
        <div
          style={{
            background: C.sidebarBg,
            borderLeft: `1px solid ${C.border}`,
          }}
        >
          <StepIndicator
            steps={steps}
            currentStepIndex={form.currentStepIndex}
          />
        </div>
      </div>
    </div>
  );
}
