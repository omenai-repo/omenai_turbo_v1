"use client";
import { AnimatePresence, motion } from "framer-motion";
import { actionStore } from "@omenai/shared-state-store/src/actions/ActionStore";
import OnboardingRequestModalForm from "./OnboardingRequestMoodalForm";

export const OnboardingRequestCompleted = () => {
  const { openOnboardingCompletedModal } = actionStore();

  return (
    <AnimatePresence key={17}>
      {openOnboardingCompletedModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="bg-slate-900/20 backdrop-blur px-2 fixed inset-0 z-50 flex justify-center place-items-center cursor-pointer"
        >
          <motion.div
            initial={{ scale: 0, rotate: "12.5deg" }}
            animate={{ scale: 1, rotate: "0deg" }}
            exit={{ scale: 0, rotate: "0deg" }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white text-dark px-6 rounded py-12 w-full max-w-lg shadow-xl cursor-default relative h-[90vh] overflow-y-scroll "
          >
            {/* Add modal form here */}
            <div className="h-auto w-full overflow-y-hidden">
              <OnboardingRequestModalForm />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
