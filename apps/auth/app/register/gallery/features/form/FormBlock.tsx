"use client";
import { GalleryLogo } from "@omenai/shared-ui-components/components/logo/Logo";
import Action from "../actions/Action";
import FormInput from "./components/FormInput";
import { AnimatePresence, motion } from "framer-motion";
export default function FormBlock() {
  return (
    <AnimatePresence key={74}>
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ y: 100 }}
        transition={{ duration: 0.33 }}
        className="w-full h-full flex items-center gap-x-8"
      >
        <div className="flex flex-col space-y-4 w-full ">
          <div className="text-[14px] ">
            <GalleryLogo />
          </div>
          <div className="flex flex-col space-y-6 w-full">
            <div>
              <h1 className="text-base sm:text-sm font-bold">
                Create a gallery Account
              </h1>
              {/* <p className="text-xs sm:text-[14px]">
                Please fill your information below
              </p> */}
            </div>

            <FormInput />
          </div>
          <div className="w-full flex justify-end">
            <Action />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
