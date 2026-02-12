// components/profile/PreferencesGrid.tsx
import React from "react";

interface PreferencesGridProps {
  selected: string[];
  onChange: (newPrefs: string[]) => void;
}

const AVAILABLE_PREFERENCES = [
  "Photography",
  "Works on paper",
  "Acrylic on canvas/linen/panel",
  "Mixed media on paper/canvas",
  "Oil on canvas/panel",
];
export default function PreferencesGrid({
  selected,
  onChange,
}: PreferencesGridProps) {
  const togglePreference = (pref: string) => {
    if (selected.includes(pref)) {
      onChange(selected.filter((p) => p !== pref));
    } else {
      if (selected.length === 5) return;
      onChange([...selected, pref]);
    }
  };

  return (
    <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm">
      <div className="mb-6">
        <h3 className="text-lg font-medium text-slate-900">
          Artistic Interests
        </h3>
        <p className="text-sm text-slate-500 font-light mt-1">
          Select the styles that resonate with you most.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        {AVAILABLE_PREFERENCES.map((pref) => {
          const isSelected = selected.includes(pref);
          return (
            <button
              key={pref}
              onClick={() => togglePreference(pref)}
              className={`
                px-5 py-2.5 rounded text-fluid-xs transition-all duration-300 ease-out border
                ${
                  isSelected
                    ? "bg-slate-900 text-white border-slate-900 shadow-md shadow-slate-900/10 hover:bg-slate-800"
                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                }
              `}
            >
              {pref}
            </button>
          );
        })}
      </div>

      <div className="mt-8 text-xs text-slate-400 font-medium flex justify-between items-center">
        <span className="capitalize">Select 5 preferences to edit</span>
        {selected.length} selected
      </div>
    </div>
  );
}
