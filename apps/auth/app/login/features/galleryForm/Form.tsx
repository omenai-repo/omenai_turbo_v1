"use client";
import { AnimatePresence, motion } from "framer-motion";
import FormInput from "./components/FormInput";
import { GalleryLogo } from "@omenai/shared-ui-components/components/logo/Logo";

export default function GalleryLoginForm() {
  return (
    <AnimatePresence key={3}>
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ y: 100 }}
        transition={{ duration: 0.33 }}
        className="w-full h-full flex items-center gap-x-8"
      >
        <div className="flex flex-col space-y-8 w-full ">
          <div className="text-fluid-xxs ">
            <GalleryLogo />
          </div>
          <div className="flex flex-col space-y-10 w-full">
            <h1 className="text-fluid-sm sm:text-fluid-md font-bold">
              Login to your gallery account.
            </h1>

            <FormInput />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
