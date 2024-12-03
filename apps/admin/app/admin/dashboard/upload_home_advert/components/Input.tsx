import React, { ChangeEvent } from "react";

type UploadInputTypes = {
  label: string;
  name: string;
  value: string;
  handleChange: (e: ChangeEvent<HTMLInputElement>) => void;
};
export function AdminUploadInput({
  label,
  name,
  value,
  handleChange,
}: UploadInputTypes) {
  return (
    <div>
      <div className="flex flex-col">
        <label htmlFor={label} className="text-xs text-[#858585]">
          {label}
        </label>
        <input
          type="text"
          value={value}
          onChange={handleChange}
          name={name}
          className="focus:ring-0 border px-4 border-dark/20 outline-none focus:outline-none h-[50px] focus:border-dark transition-all duration-200 ease-in-out ring-0 placeholder:text-dark/40 py-1"
          required
        />
      </div>
    </div>
  );
}
