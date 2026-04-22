// components/programming/PremiumCountrySelect.tsx
import React from "react";
import { Country } from "country-state-city";

const ALL_COUNTRIES = Country.getAllCountries();

export const PremiumCountrySelect = ({
  value,
  onChange,
  error,
}: {
  value: string;
  onChange: (val: string) => void;
  error?: string;
}) => {
  return (
    <div
      className={`relative flex items-center pb-2 transition-colors duration-200 group ${
        error
          ? "border-red-400"
          : "border-neutral-200 hover:border-neutral-400 focus-within:border-neutral-700"
      }`}
    >
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full appearance-none bg-transparent border-t-0 border-x-0 border-b border-neutral-300 ring-0 outline-none focus:outline-none focus:ring-0 focus:border-b-dark cursor-pointer leading-none select-none transition-colors duration-200 ${
          value
            ? "text-sm text-neutral-800 tracking-wide"
            : "text-[11px] uppercase tracking-widest text-neutral-400 font-medium"
        }`}
      >
        <option
          value=""
          disabled
          className="text-neutral-400 text-sm normal-case tracking-normal"
        >
          Select country
        </option>
        {ALL_COUNTRIES.map((country) => (
          <option
            key={country.isoCode}
            value={country.name}
            className="text-neutral-800 text-sm normal-case tracking-normal"
          >
            {country.flag} {country.name}
          </option>
        ))}
      </select>

      {/* Chevron — pointer-events-none so it never blocks the select */}
      <svg
        className={`w-[15px] h-[15px] shrink-0 pointer-events-none transition-colors duration-200 ${
          value
            ? "text-neutral-500"
            : "text-neutral-300 group-hover:text-neutral-400"
        }`}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.25}
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>

      {/* Error — absolute so it never shifts the row height */}
      {error && (
        <p className="absolute top-full left-0 mt-1 text-[11px] text-red-400 tracking-wide">
          {error}
        </p>
      )}
    </div>
  );
};
