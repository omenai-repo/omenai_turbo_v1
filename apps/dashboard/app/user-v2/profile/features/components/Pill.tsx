"use client";

import { individualProfileUdateStore } from "@omenai/shared-state-store/src/individual/individual_profile_update/IndividualProfileUpdateStore";
import { motion } from "framer-motion";

type PillProps = {
  text: string;
  selected?: boolean;
};
export default function Pill({ text }: PillProps) {
  const { updateData, setProfileUpdateData } = individualProfileUdateStore();
  const isSelected = updateData?.preferences?.includes(text);

  return (
    <button
      type="button"
      onClick={() => setProfileUpdateData("preferences", text)}
      className={`
        relative
        px-4 
        py-2 
        rounded-full 
        font-medium 
        text-sm
        transition-all 
        duration-200
        transform
        active:scale-95
        focus:outline-none
        focus:ring-2
        focus:ring-offset-2
        ${
          isSelected
            ? "bg-slate-900 text-white shadow-md focus:ring-slate-500"
            : "bg-white text-slate-700 border border-slate-300 hover:border-slate-400 focus:ring-slate-400"
        }
      `}
    >
      <span className="relative z-10 flex items-center gap-2">
        {isSelected && (
          <motion.svg
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </motion.svg>
        )}
        {text}
      </span>

      {/* Selection Animation */}
      {isSelected && (
        <motion.div
          layoutId={`pill-bg-${text}`}
          className="absolute inset-0 bg-dark rounded-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{ zIndex: 0 }}
        />
      )}
    </button>
  );
}
