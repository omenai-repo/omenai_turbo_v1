// components/profile/FloatingActionBar.tsx
import { LoadSmall } from "@omenai/shared-ui-components/components/loader/Load";
import React from "react";

export default function FloatingActionBar({
  isVisible,
  onSave,
  onReset,
  loading,
}: {
  isVisible: boolean;
  onSave: () => void;
  onReset: () => void;
  loading: boolean;
}) {
  if (!isVisible) return null;

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-10 fade-in duration-300">
      <div className="flex items-center gap-2 p-2 pr-4 bg-slate-900/90 backdrop-blur-md text-white rounded-full shadow-2xl shadow-slate-900/20 border border-white/10">
        <button
          onClick={onReset}
          className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
        >
          Discard
        </button>
        <div className="w-px h-4 bg-white/20"></div>
        <button
          onClick={onSave}
          className="pl-2 pr-4 py-2 text-sm font-semibold text-white flex items-center justify-center gap-2"
        >
          {loading ? (
            <LoadSmall />
          ) : (
            <>
              <span>Save Changes</span>
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
