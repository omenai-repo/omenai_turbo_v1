"use client";

import { useArtistAuthStore } from "@omenai/shared-state-store/src/auth/register/ArtistAuthStore";
import { motion } from "framer-motion";

type PillProps = {
  text: string;
  art_styles: string[];
  logo: string;
};
export default function Pill({ text, art_styles, logo }: PillProps) {
  const { artistSignupData, updateArtistSignupData, setIsFieldDirty } =
    useArtistAuthStore();
  const selectPill = (text: string) => {
    updateArtistSignupData("art_style", text);
    setIsFieldDirty("art_style", false);
  };
  return (
    <button
      type="button"
      onClick={() => selectPill(text)}
      className={`
        relative
        px-4 
        py-2 
        rounded-full 
        font-normal 
        text-fluid-xs
        transition-all 
        duration-200
        transform
        active:scale-95
        focus:outline-none
        focus:ring-2
        focus:ring-offset-2
        ${
          artistSignupData.art_style === text
            ? "bg-slate-900 text-white shadow-md focus:ring-slate-500"
            : "bg-white text-slate-700 border border-slate-300 hover:border-slate-400 focus:ring-slate-400"
        }
      `}
    >
      <span className="relative z-10 flex items-center gap-2">
        {artistSignupData.art_style === text && (
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
      {artistSignupData.art_style === text && (
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
