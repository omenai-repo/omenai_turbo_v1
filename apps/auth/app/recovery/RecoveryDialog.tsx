"use client";
import { GrClose } from "react-icons/gr";
import RecoveryEmailInputField from "./components/RecoveryEmailInputField";
import { AnimatePresence, motion } from "framer-motion";
import { actionStore } from "@omenai/shared-state-store/src/actions/ActionStore";
export default function Recovery() {
  const { recoveryModal, updateRecoveryModal } = actionStore();

  return (
    <AnimatePresence key={6}>
      <motion.div
        className={` ${
          recoveryModal.value ? "fixed" : "hidden"
        } fixed inset-0 grid place-items-center p-2 z-50 bg-dark/90`}
      >
        <div className="flex flex-col gap-8 items-center">
          <div className="bg-white max-w-[450px] flex flex-col gap-y-8 px-5 py-8 rounded relative">
            <div className="absolute top-5 right-5">
              <GrClose
                className="cursor-pointer"
                onClick={() => {
                  updateRecoveryModal("closed");
                }}
              />
            </div>
            <div className="">
              <h1 className="text-fluid-sm font-light">Let us help</h1>
              <p className="text-fluid-xs font-semibold">
                Enter your email so we can help recover your account
              </p>
            </div>
            <div className="flex flex-col gap-6">
              <RecoveryEmailInputField />
            </div>
            <div>
              <p className="text-fluid-xs font-normal text-red-600">
                Kindly note that a link will be sent to your email address.
                Click the link to complete this process.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
