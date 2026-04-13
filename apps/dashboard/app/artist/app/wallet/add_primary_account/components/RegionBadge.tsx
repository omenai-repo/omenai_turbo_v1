"use client";

/**
 * RegionBadge — Displays the auto-detected country and region type.
 * Design: a small soft card with region label and a verified checkmark.
 */

import React from "react";
import { MapPin, CheckCircle2 } from "lucide-react";
import { RegionType } from "@omenai/shared-hooks/hooks/useAccountForm";

const C = {
  navy: "#091830",
  navySoft: "rgba(9,24,48,0.06)",
  border: "#e8e2d4",
  textMuted: "#8a7f6e",
  textLight: "#b5ad9e",
  success: "#3d6b50",
  successBg: "rgba(61,107,80,0.08)",
  bodyFont: "'DM Sans', system-ui, sans-serif",
};

const REGION_LABELS: Record<RegionType, string> = {
  africa: "African Transfer",
  uk: "UK — Faster Payments",
  us: "US — ACH / Wire",
  eu: "SEPA / SWIFT",
};

interface RegionBadgeProps {
  country: string;
  regionType: RegionType;
}

export function RegionBadge({ country, regionType }: RegionBadgeProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "14px 16px",
        background: C.navySoft,
        borderRadius: "10px",
        border: `1px solid ${C.border}`,
        fontFamily: C.bodyFont,
      }}
    >
      {/* Left: pin icon + country */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "8px",
            background: "rgba(9,24,48,0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <MapPin size={14} style={{ color: C.navy }} strokeWidth={1.75} />
        </div>

        <div>
          <p
            style={{
              margin: "0 0 1px 0",
              fontSize: "13px",
              fontWeight: 500,
              color: C.navy,
              letterSpacing: "0.01em",
            }}
          >
            {country}
          </p>
          <p
            style={{
              margin: 0,
              fontSize: "11px",
              color: C.textMuted,
              letterSpacing: "0.02em",
            }}
          >
            {REGION_LABELS[regionType]}
          </p>
        </div>
      </div>

      {/* Right: verified pill */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "5px",
          padding: "4px 10px",
          background: C.successBg,
          borderRadius: "20px",
        }}
      >
        <CheckCircle2 size={11} style={{ color: C.success }} strokeWidth={2} />
        <span
          style={{
            fontSize: "10px",
            fontWeight: 500,
            color: C.success,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          Detected
        </span>
      </div>
    </div>
  );
}
