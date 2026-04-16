"use client";

/**
 * VerifiedBadge — Shown after successful Africa account validation.
 * Displays the verified account name in a softly animated success card.
 */

import React from "react";
import { BadgeCheck } from "lucide-react";

const C = {
  navy: "#091830",
  success: "#3d6b50",
  successBg: "#f2f7f4",
  successBdr: "#c5d9cc",
  textMuted: "#5a7f6a",
  bodyFont: "'DM Sans', system-ui, sans-serif",
  displayFont: "'Cormorant Garamond', Georgia, serif",
};

interface VerifiedBadgeProps {
  accountName: string;
  accountNumber: string;
}

export function VerifiedBadge({
  accountName,
  accountNumber,
}: VerifiedBadgeProps) {
  return (
    <div
      role="status"
      aria-label="Account verified"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "14px 16px",
        background: C.successBg,
        border: `1px solid ${C.successBdr}`,
        borderRadius: "10px",
        fontFamily: C.bodyFont,
        animation: "fadeSlideIn 0.3s ease forwards",
      }}
    >
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Icon */}
      <div
        style={{
          flexShrink: 0,
          width: "34px",
          height: "34px",
          borderRadius: "50%",
          background: "rgba(61,107,80,0.12)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <BadgeCheck size={16} style={{ color: C.success }} strokeWidth={1.75} />
      </div>

      {/* Text */}
      <div>
        <p
          style={{
            margin: "0 0 2px 0",
            fontSize: "10px",
            fontWeight: 500,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: C.textMuted,
          }}
        >
          Verified Account
        </p>
        <p
          style={{
            margin: 0,
            fontSize: "15px",
            fontWeight: 600,
            color: C.success,
            letterSpacing: "0.01em",
          }}
        >
          {accountName}
        </p>
        <p
          style={{ margin: "2px 0 0 0", fontSize: "11px", color: C.textMuted }}
        >
          ···· {accountNumber.slice(-4)}
        </p>
      </div>
    </div>
  );
}
