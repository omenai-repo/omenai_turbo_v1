"use client";
import { actionStore } from "@omenai/shared-state-store/src/actions/ActionStore";
import React from "react";
import { motion } from "framer-motion";

type CuratorialManifestProps = {
  preferences: string[];
  setIsFading: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function CuratorialManifest({
  preferences,
  setIsFading,
}: CuratorialManifestProps) {
  const { curated_preference, set_curated_preference } = actionStore();

  const handleFilterChange = (medium: string) => {
    if (curated_preference === medium) return;
    setIsFading(true);
    setTimeout(() => {
      set_curated_preference(medium);
      setIsFading(false);
    }, 400);
  };

  const categories = ["All", ...preferences];

  return (
    <div className="mb-12 border-y border-neutral-100 py-4">
      <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 md:justify-start">
        <span className="font-serif italic text-neutral-400">Index:</span>
        {categories.map((item) => {
          const isActive = curated_preference === item;
          return (
            <button
              key={item}
              onClick={() => handleFilterChange(item)}
              className="group relative"
            >
              <span
                className={`font-mono text-[10px] uppercase tracking-[0.2em] transition-colors duration-300 ${
                  isActive
                    ? "text-dark"
                    : "text-neutral-400 hover:text-neutral-600"
                }`}
              >
                {item}
              </span>
              {/* Active Indicator Line */}
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute -bottom-4 left-0 h-[1px] w-full bg-dark"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
