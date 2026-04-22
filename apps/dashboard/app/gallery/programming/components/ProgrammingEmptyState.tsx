// components/programming/ProgrammingEmptyState.tsx
import React from "react";

interface EmptyStateProps {
  view: "active" | "past";
  onCreateClick: () => void;
}

export const ProgrammingEmptyState = ({
  view,
  onCreateClick,
}: EmptyStateProps) => {
  return (
    <div className="w-full py-24 flex flex-col items-center justify-center border border-neutral-100 bg-neutral-50/30 rounded-sm ">
      <div className="w-16 h-16 bg-white border border-neutral-100 rounded-sm -full flex items-center justify-center mb-6 shadow-sm">
        <svg
          className="w-6 h-6 text-neutral-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
      </div>
      <h3 className="text-base font-medium text-dark mb-2">
        No {view} programming
      </h3>
      <p className="text-sm text-neutral-500 mb-8 max-w-sm text-center leading-relaxed">
        {view === "active"
          ? "Curate your next exhibition, art fair presentation, or digital viewing room."
          : "Your archived and completed events will securely live here."}
      </p>

      {view === "active" && (
        <button
          onClick={onCreateClick}
          className="text-xs font-medium tracking-widest uppercase border-b border-dark text-dark pb-0.5 hover:text-neutral-500 hover:border-neutral-500 transition-colors"
        >
          Begin Curation
        </button>
      )}
    </div>
  );
};
