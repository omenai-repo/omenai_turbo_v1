"use client";
import React, { ChangeEvent, useEffect } from "react";
import { ChevronDown } from "lucide-react";

// 1. Use Omit to strictly separate your custom props from native ones
interface SelectProps extends Omit<
  React.SelectHTMLAttributes<HTMLSelectElement>,
  "value" | "onChange"
> {
  label: string;
  options: { value: string; label: string }[];
  value: string; // Enforce string for controlled state
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
}

export const AtelierSelect = ({
  label,
  options,
  value,
  onChange,
  className, // Destructure className to merge it
  ...props
}: SelectProps) => {
  useEffect(() => {
    console.log(`AtelierSelect [${label}] received value:`, value);
  }, [value]);
  return (
    <div className="flex flex-col gap-2 w-full relative group">
      <label className="font-sans text-[10px] uppercase tracking-[0.2em] text-neutral-500">
        {label} {props.required && "*"}
      </label>
      <div className="relative">
        <select
          {...props}
          value={value}
          onChange={onChange}
          className={`
            w-full appearance-none rounded-none
            border-b border-neutral-300 bg-transparent py-3 pr-8 
            font-sans text-sm text-black 
            focus:border-black focus:outline-none focus:ring-0
            cursor-pointer z-10 relative
            transition-colors placeholder:text-neutral-400
            ${className || ""} 
          `}
        >
          {/* 3. Placeholder Logic */}
          <option value="" disabled className="text-neutral-400">
            Select...
          </option>

          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="text-black">
              {opt.label}
            </option>
          ))}
        </select>

        {/* 4. Icon Pointer Events */}
        {/* <ChevronDown
          className="absolute right-0 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none z-0 group-hover:text-black transition-colors"
          size={16}
        /> */}
      </div>
    </div>
  );
};
