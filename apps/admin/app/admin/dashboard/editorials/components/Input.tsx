import React, { ChangeEvent } from "react";

type UploadInputTypes = {
  label: string;
  name: string;
  value: string;
  inputType?: string;
  placeholder?: string;
  handleChange: (e: ChangeEvent<HTMLInputElement>) => void;
};
export function AdminUploadInput({
  label,
  name,
  value,
  handleChange,
  inputType,
  placeholder,
}: UploadInputTypes) {
  return (
    <div>
      <div className="flex flex-col">
        <label htmlFor={label} className="text-fluid-xs text-[#858585]">
          {label}
        </label>
        <input
          type={inputType ? inputType : "text"}
          value={value}
          onChange={handleChange}
          name={name}
          placeholder={placeholder ? placeholder : ""}
          className="focus:ring-0 border px-4 border-dark/20 outline-none focus:outline-none h-[50px] focus:border-dark transition-all duration-200 ease-in-out ring-0 placeholder:text-dark/40 py-1"
          required
        />
      </div>
    </div>
  );
}
