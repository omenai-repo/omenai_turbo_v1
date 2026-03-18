"use client";
import { AnimatePresence, motion } from "framer-motion";
import FormInput from "./FormInput";
import { IndividualLogo } from "@omenai/shared-ui-components/components/logo/Logo";

export default function AdminLoginForm() {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full flex flex-col space-y-8"
      >
        <div className="flex flex-col items-center justify-center text-center space-y-6">
          <div className="scale-110">
            <IndividualLogo />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
              Admin Portal
            </h1>
            <p className="text-sm text-gray-500">
              Enter your credentials to manage your platform.
            </p>
          </div>
        </div>

        <FormInput />
      </motion.div>
    </AnimatePresence>
  );
}
