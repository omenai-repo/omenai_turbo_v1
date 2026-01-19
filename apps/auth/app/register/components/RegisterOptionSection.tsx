"use client";
import { IndividualLogo } from "@omenai/shared-ui-components/components/logo/Logo";
import { AnimatePresence, motion } from "framer-motion";
import React from "react";
import RegisterOptions from "./RegisterOptions";

export default function RegisterOptionSection() {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="register-selector-stage"
        initial={{ opacity: 0, scale: 0.99, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        transition={{
          duration: 0.7,
          ease: [0.19, 1, 0.22, 1], // Super smooth "Expo" easing
        }}
        className="w-full flex flex-col items-center md:items-start"
      >
        <div className="w-full max-w-[500px]">
          {/* Registration Options Component */}
          <div className="w-full">
            <RegisterOptions />
          </div>

          {/* Social Proof / Trust Footnote */}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
