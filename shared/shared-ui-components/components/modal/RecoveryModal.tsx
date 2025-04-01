"use client";
import { actionStore } from "@omenai/shared-state-store/src/actions/ActionStore";
import { AnimatePresence, motion } from "framer-motion";
import RecoveryModalForm from "./RecoveryModalForm";

const RecoveryModal = () => {
  const { openLoginModalRecoveryForm, toggleLoginModalRecoveryForm } =
    actionStore();

  return (
    <AnimatePresence key={29}>
      {openLoginModalRecoveryForm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => toggleLoginModalRecoveryForm(false)}
          className="bg-slate-900/20 backdrop-blur py-8 px-2 fixed inset-0 z-50 grid place-items-center cursor-pointer"
        >
          <motion.div
            initial={{ scale: 0, rotate: "12.5deg" }}
            animate={{ scale: 1, rotate: "0deg" }}
            exit={{ scale: 0, rotate: "0deg" }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white text-gray-700 p-6 rounded-lg w-full max-w-lg shadow-xl cursor-default relative h-auto"
          >
            {/* Add modal form here */}
            <RecoveryModalForm />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RecoveryModal;
