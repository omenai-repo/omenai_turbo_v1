// components/shared/CountryCombobox.tsx
"use client";

import React, { useState, useRef, useEffect } from "react";

import { Country, ICountry } from "country-state-city";

interface CountryComboboxProps {
  value: string;
  onChange: (country: string) => void;
}

export const CountryCombobox = ({ value, onChange }: CountryComboboxProps) => {
  const [query, setQuery] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const COUNTRIES: ICountry[] = Country.getAllCountries();

  // Sync external value changes
  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        // Strict enforcement: if they typed a typo and clicked out, clear it
        const foundCountry = COUNTRIES.find((country) => {
          return country.name === query;
        });
        if (!foundCountry) {
          setQuery("");
          onChange("");
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [query, onChange]);

  const filteredCountries = COUNTRIES.filter((country) =>
    country.name.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div ref={wrapperRef} className="relative w-full">
      <input
        type="text"
        value={query}
        placeholder="e.g. Nigeria"
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
          onChange(""); // Clear actual form state until a valid selection is made
        }}
        onFocus={() => setIsOpen(true)}
        className="w-full bg-transparent border-0 border-b border-neutral-300 py-2 text-sm text-neutral-900 placeholder-neutral-400 focus:border-neutral-900 focus:ring-0 transition-colors outline-none"
      />

      {isOpen && filteredCountries.length > 0 && (
        <div className="absolute top-full left-0 w-full mt-1 bg-white border border-neutral-100 shadow-[0_8px_30px_rgb(0,0,0,0.08)] max-h-72 overflow-y-auto z-50 rounded-sm  ">
          {filteredCountries.map((country) => (
            <div
              key={country.name}
              onClick={() => {
                setQuery(country.name);
                onChange(country.name);
                setIsOpen(false);
              }}
              className="px-3 py-2.5 text-sm text-neutral-900 hover:bg-neutral-50 cursor-pointer transition-colors border-b border-neutral-50 last:border-0"
            >
              {country.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
