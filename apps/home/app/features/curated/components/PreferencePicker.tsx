"use client";
import { actionStore } from "@omenai/shared-state-store/src/actions/ActionStore";
import React, { useState } from "react";

type PreferencePickerProps = {
  preferences: string[];
  setIsFading: React.Dispatch<React.SetStateAction<boolean>>;
};
export default function PreferencePicker({
  preferences,
  setIsFading,
}: PreferencePickerProps) {
  const { curated_preference, set_curated_preference } = actionStore();
  const handleFilterChange = (medium: string) => {
    setIsFading(true); // Trigger fade-out
    setTimeout(() => {
      set_curated_preference(medium);
      setIsFading(false); // Trigger fade-in
    }, 300); // Match the fade-out duration
  };
  return (
    <div className="w-full flex justify-center items-center mb-8">
      <div>
        <ul className="flex flex-wrap justify-center gap-5 text-dark font-medium text-sm">
          <li onClick={() => handleFilterChange("All")}>
            <button
              className={`rounded-full w-fit border border-[#E0E0E0] hover:ring-2 hover:ring-[#E0E0E0] text-xs transition-all ease-linear duration-100 px-4 py-2 ${
                curated_preference === "All"
                  ? "bg-dark text-white"
                  : "bg-transparent text-dark"
              }`}
            >
              All
            </button>
          </li>
          {preferences.map((preference) => {
            return (
              <li
                onClick={() => handleFilterChange(preference)}
                key={preference}
              >
                <button
                  className={`rounded-full w-fit border border-[#E0E0E0] hover:ring-2 hover:ring-[#E0E0E0] text-xs transition-all ease-linear duration-100 px-4 py-2 ${
                    curated_preference === preference
                      ? "bg-dark text-white"
                      : "bg-transparent text-dark"
                  }`}
                >
                  {preference}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
