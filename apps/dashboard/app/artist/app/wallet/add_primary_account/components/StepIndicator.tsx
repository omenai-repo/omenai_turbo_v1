"use client";

/**
 * StepIndicator — Vertical step progress panel
 *
 * Replaces the old decorative right panel with a functional step guide.
 * Design: editorial, large step numbers in Cormorant Garamond serif,
 * muted connecting lines, navy accent on active step.
 */

import React from "react";
import { ShieldCheck, Lock } from "lucide-react";
import { Step } from "@omenai/shared-hooks/hooks/useAccountForm";

const C = {
  navy: "#091830",
  navySoft: "rgba(9,24,48,0.07)",
  cream: "#fffdf0",
  border: "#e0dbd0",
  textMuted: "#8a7f6e",
  textLight: "#b5ad9e",
  displayFont: "'Cormorant Garamond', Georgia, serif",
  bodyFont: "'DM Sans', system-ui, sans-serif",
  connectorDone: "#091830",
  connectorTodo: "#dedad0",
};

interface StepIndicatorProps {
  steps: Step[];
  currentStepIndex: number;
}

export function StepIndicator({ steps, currentStepIndex }: StepIndicatorProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        height: "100%",
        padding: "48px 40px 40px 48px",
        fontFamily: C.bodyFont,
      }}
    >
      {/* Header */}
      <div>
        <p
          style={{
            fontSize: "11px",
            fontWeight: 500,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: C.textMuted,
            marginBottom: "32px",
            margin: "0 0 40px 0",
          }}
        >
          Progress
        </p>

        {/* Steps */}
        <ol style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {steps.map((step, i) => {
            const isLast = i === steps.length - 1;
            const isComplete = step.status === "complete";
            const isActive = step.status === "active";
            const isUpcoming = step.status === "upcoming";

            return (
              <li key={step.index} style={{ position: "relative" }}>
                {/* Connector line */}
                {!isLast && (
                  <div
                    aria-hidden="true"
                    style={{
                      position: "absolute",
                      left: "19px",
                      top: "40px",
                      width: "1px",
                      height: "calc(100% - 16px)",
                      background: isComplete
                        ? C.connectorDone
                        : C.connectorTodo,
                      transition: "background 0.4s ease",
                    }}
                  />
                )}

                {/* Step row */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "16px",
                    paddingBottom: isLast ? 0 : "32px",
                    opacity: isUpcoming ? 0.45 : 1,
                    transition: "opacity 0.3s ease",
                  }}
                >
                  {/* Step node */}
                  <div
                    style={{
                      flexShrink: 0,
                      width: "38px",
                      height: "38px",
                      borderRadius: "50%",
                      border: `1.5px solid ${isComplete || isActive ? C.navy : C.border}`,
                      background: isComplete
                        ? C.navy
                        : isActive
                          ? C.navy
                          : "transparent",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.3s ease",
                      position: "relative",
                      zIndex: 1,
                    }}
                  >
                    {isComplete ? (
                      // Checkmark
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 14 14"
                        fill="none"
                        aria-label="Complete"
                      >
                        <path
                          d="M2.5 7L5.5 10L11.5 4"
                          stroke={C.cream}
                          strokeWidth="1.75"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : (
                      // Step number
                      <span
                        style={{
                          fontFamily: C.displayFont,
                          fontSize: "15px",
                          fontWeight: 500,
                          color: isActive ? C.cream : C.textLight,
                          lineHeight: 1,
                          transition: "color 0.3s ease",
                          letterSpacing: "0.02em",
                        }}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    )}
                  </div>

                  {/* Step text */}
                  <div style={{ paddingTop: "6px" }}>
                    <p
                      style={{
                        margin: "0 0 3px 0",
                        fontSize: "13px",
                        fontWeight: isActive ? 500 : 400,
                        color: isActive || isComplete ? C.navy : C.textMuted,
                        transition: "color 0.3s ease",
                        letterSpacing: "0.01em",
                      }}
                    >
                      {step.label}
                    </p>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "11px",
                        color: C.textLight,
                        lineHeight: 1.5,
                      }}
                    >
                      {step.description}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      {/* Footer trust block */}
      <div
        style={{
          borderTop: `1px solid ${C.border}`,
          paddingTop: "24px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
          <ShieldCheck
            size={15}
            style={{ color: C.textMuted, flexShrink: 0, marginTop: "1px" }}
            strokeWidth={1.5}
          />
          <p
            style={{
              margin: 0,
              fontSize: "11px",
              color: C.textMuted,
              lineHeight: 1.6,
            }}
          >
            Your banking details are encrypted end-to-end using bank-grade
            AES-256 security.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
          <Lock
            size={15}
            style={{ color: C.textMuted, flexShrink: 0, marginTop: "1px" }}
            strokeWidth={1.5}
          />
          <p
            style={{
              margin: 0,
              fontSize: "11px",
              color: C.textMuted,
              lineHeight: 1.6,
            }}
          >
            We never store raw credentials. Payouts are processed through
            verified payment rails.
          </p>
        </div>
      </div>
    </div>
  );
}
