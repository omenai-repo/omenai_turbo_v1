"use client";
import { IndividualLogo } from "@omenai/shared-ui-components/components/logo/Logo";
import { AnimatePresence, motion } from "framer-motion";
import React from "react";
import RegisterOptions from "./RegisterOptions";

export default function RegisterOptionSection() {
  return (
    <AnimatePresence key={94}>
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ y: 100 }}
        transition={{ duration: 0.33 }}
        className="w-full h-full flex items-center justify-center gap-x-8"
      >
        <div className="flex justify-center w-full">
          <div className="w-full h-full flex flex-col max-w-[500px] px-4 gap-y-8 overflow-x-hidden">
            <div className="flex flex-col space-y-6">
              <IndividualLogo />
              <h1 className="text-fluid-base sm:text-fluid-sm font-bold">
                Create an account today
              </h1>
            </div>
            <RegisterOptions />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
