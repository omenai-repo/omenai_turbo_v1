"use client";

import React from "react";
import { ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { RegionType } from "@omenai/shared-hooks/hooks/useAccountForm";
const C = {
  navy: "#091830",
  navyHover: "#0d2444",
  cream: "#fffdf0",
  creamDim: "rgba(255,253,240,0.7)",
  border: "#e8e2d4",
  textMuted: "#8a7f6e",
  disabled: "rgba(9,24,48,0.25)",
  disabledBg: "rgba(9,24,48,0.05)",
  bodyFont: "'DM Sans', system-ui, sans-serif",
  verifyBg: "rgba(9,24,48,0.06)",
  verifyColor: "#091830",
};

interface FormActionsProps {
  regionType: RegionType;
  isValidated: boolean;
  loading: boolean;
  canValidate: boolean;
  canSubmit: boolean;
  onValidate: () => void;
  onSubmit: () => void;
}

export function FormActions({
  regionType,
  isValidated,
  loading,
  canValidate,
  canSubmit,
  onValidate,
  onSubmit,
}: FormActionsProps) {
  const showValidateButton = regionType === "africa" && !isValidated;

  const buttonLabel = showValidateButton
    ? "Validate Account"
    : "Confirm & Link Account";
  const isDisabled =
    loading ||
    (showValidateButton ? !canValidate : !canSubmit && regionType !== "africa");
  const handleClick = showValidateButton ? onValidate : onSubmit;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        paddingTop: "8px",
      }}
    >
      <button
        type="button"
        onClick={handleClick}
        disabled={isDisabled}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          padding: "13px 20px",
          fontSize: "13px",
          fontWeight: 500,
          fontFamily: C.bodyFont,
          letterSpacing: "0.04em",
          background: isDisabled ? C.disabledBg : C.navy,
          color: isDisabled ? C.disabled : C.cream,
          border: `1px solid ${isDisabled ? C.border : C.navy}`,
          borderRadius: "8px",
          cursor: isDisabled ? "not-allowed" : "pointer",
          transition:
            "background 0.2s ease, transform 0.1s ease, box-shadow 0.2s ease",
          boxShadow: isDisabled ? "none" : "0 2px 12px rgba(9,24,48,0.18)",
        }}
        onMouseEnter={(e) => {
          if (!isDisabled) {
            (e.currentTarget as HTMLButtonElement).style.background =
              C.navyHover;
            (e.currentTarget as HTMLButtonElement).style.transform =
              "translateY(-1px)";
            (e.currentTarget as HTMLButtonElement).style.boxShadow =
              "0 4px 18px rgba(9,24,48,0.24)";
          }
        }}
        onMouseLeave={(e) => {
          if (!isDisabled) {
            (e.currentTarget as HTMLButtonElement).style.background = C.navy;
            (e.currentTarget as HTMLButtonElement).style.transform =
              "translateY(0)";
            (e.currentTarget as HTMLButtonElement).style.boxShadow =
              "0 2px 12px rgba(9,24,48,0.18)";
          }
        }}
        onMouseDown={(e) => {
          if (!isDisabled)
            (e.currentTarget as HTMLButtonElement).style.transform =
              "translateY(0)";
        }}
      >
        {loading ? (
          <>
            <Loader2
              size={14}
              style={{ animation: "spin 0.8s linear infinite" }}
            />
            <span>{showValidateButton ? "Validating…" : "Linking…"}</span>
          </>
        ) : (
          <>
            {!showValidateButton && <CheckCircle2 size={14} strokeWidth={2} />}
            <span>{buttonLabel}</span>
            {showValidateButton && <ArrowRight size={14} strokeWidth={2} />}
          </>
        )}
      </button>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
