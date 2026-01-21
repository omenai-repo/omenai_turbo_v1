"use client";
import { AnimatePresence, motion } from "framer-motion";
import LoginOptions from "./LoginOptions";
import { IndividualLogo } from "@omenai/shared-ui-components/components/logo/Logo";

export default function LoginOptionWrapper() {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="login-option-selector"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{
          duration: 0.6,
          ease: [0.22, 1, 0.36, 1], // Premium fluid easing
        }}
        className="w-full flex flex-col items-center md:items-start"
      >
        <div className="w-full max-w-[500px]">
          {/* Options Grid/List */}
          <div className="w-full">
            <LoginOptions />
          </div>

          {/* Subtle Help Text */}
          {/* TODO: Add mailto */}
          <p className="mt-12 text-[10px] text-slate-400 uppercase tracking-[0.2em] font-medium text-center md:text-left">
            Need assistance?{" "}
            <span className="text-dark cursor-pointer border-b border-dark pb-0.5">
              Contact Concierge
            </span>
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
