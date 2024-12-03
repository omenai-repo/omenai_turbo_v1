"use client";
import { AnimatePresence, motion } from "framer-motion";
import FormInput from "./components/FormInput";

import { AdminLogo } from "@omenai/shared-ui-components/components/logo/Logo";

export default function Form() {
  return (
    <AnimatePresence key={4}>
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ y: 100 }}
        transition={{ duration: 0.33 }}
        className="w-full py-[20px] md:py-[30px] lg:px-[2rem] xl:px-[4rem] 2xl:px-[7rem]"
      >
        <div className="text-center text-xs flex items-center flex-col mt-10">
          <AdminLogo />
          <p className="text-[#616161] mt-5">
            Welcome back. kindly login to your admin account
          </p>
        </div>
        <div className="mt-[40px]">
          <FormInput />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
