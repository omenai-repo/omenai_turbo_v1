"use client";

/**
 * FormField — Reusable input component
 *
 * Design: Minimal underline-only style with a navy animated focus line.
 * Colors follow the brand palette: navy #091830 on cream #fffdf0.
 *
 * Add to your global CSS / layout:
 *   @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');
 */

import React, { useState, useId } from "react";

const C = {
  navy: "#091830",
  navyAlpha10: "rgba(9,24,48,0.10)",
  cream: "#fffdf0",
  border: "#dedad0",
  borderFocus: "#091830",
  labelColor: "#7a7060",
  labelFocus: "#091830",
  bodyFont: "'DM Sans', system-ui, sans-serif",
  error: "#a0473a",
  disabledBg: "rgba(9,24,48,0.03)",
  disabledText: "#b5ac9a",
  placeholder: "#c0b9aa",
};

export interface FormFieldProps {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
  description?: string;
  maxLength?: number;
  error?: string;
  type?: "text" | "number" | "email";
  autoComplete?: string;
}

export function FormField({
  label,
  placeholder,
  value,
  onChange,
  disabled = false,
  required = false,
  description,
  maxLength,
  error,
  type = "text",
  autoComplete,
}: FormFieldProps) {
  const id = useId();
  const [focused, setFocused] = useState(false);

  const hasValue = value.length > 0;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "4px",
        fontFamily: C.bodyFont,
      }}
    >
      {/* Label */}
      <label
        htmlFor={id}
        style={{
          fontSize: "11px",
          fontWeight: 500,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: focused ? C.labelFocus : C.labelColor,
          transition: "color 0.2s ease",
          userSelect: "none",
          cursor: disabled ? "not-allowed" : "default",
        }}
      >
        {label}
        {required && (
          <span
            style={{ color: C.error, marginLeft: "2px" }}
            aria-hidden="true"
          >
            *
          </span>
        )}
      </label>

      {/* Input wrapper with animated underline */}
      <div style={{ position: "relative" }}>
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.currentTarget.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          disabled={disabled}
          maxLength={maxLength}
          placeholder={focused ? placeholder || "" : ""}
          autoComplete={autoComplete}
          style={{
            width: "100%",
            padding: "10px 0 10px 0",
            fontSize: "14px",
            fontWeight: 400,
            fontFamily: C.bodyFont,
            color: disabled ? C.disabledText : C.navy,
            background: disabled ? C.disabledBg : "transparent",

            // Core resets to kill browser default rings
            border: "none",
            outline: "none",
            boxShadow: "none",
            WebkitAppearance: "none", // Kills iOS default styling
            WebkitTapHighlightColor: "transparent", // Kills mobile tap highlight
            borderRadius: 0,
            boxSizing: "border-box",

            // Animated border logic: Error -> Focused (Navy) -> Default (Border)
            borderBottom: `1.5px solid ${
              error ? C.error : focused ? C.navy : C.border
            }`,

            cursor: disabled ? "not-allowed" : "text",
            transition: "border-color 0.3s ease, color 0.3s ease",
          }}
          aria-required={required}
          aria-invalid={!!error}
          aria-describedby={description ? `${id}-desc` : undefined}
        />

        {/* Animated focus line */}
        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            height: "1.5px",
            width: "100%",
            background: error ? C.error : C.navy,
            transform: focused ? "scaleX(1)" : "scaleX(0)",
            transformOrigin: "left center",
            transition: "transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
            pointerEvents: "none",
          }}
        />
      </div>

      {/* Description */}
      {description && !error && (
        <p
          id={`${id}-desc`}
          style={{
            fontSize: "11px",
            color: C.labelColor,
            margin: 0,
            fontStyle: "italic",
          }}
        >
          {description}
        </p>
      )}

      {/* Error message */}
      {error && (
        <p
          role="alert"
          style={{
            fontSize: "11px",
            color: C.error,
            margin: 0,
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <span aria-hidden="true">×</span>
          {error}
        </p>
      )}
    </div>
  );
}
