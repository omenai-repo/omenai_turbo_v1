"use client";

import { artistActionStore } from "@omenai/shared-state-store/src/artist/actions/ActionStore";

import WalletPinModalForm from "./WalletPinModalForm";
import { AnimatePresence, motion } from "framer-motion";

export const WalletPinModal = () => {
  const { toggleWalletPinPopup, walletPinPopup } = artistActionStore();

  return (
    <AnimatePresence key={13}>
      {walletPinPopup && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          //   onClick={() => {
          //     toggleWalletPinPopup(false);
          //   }}
          className="bg-slate-900/20 backdrop-blur py-8 px-2 fixed inset-0 z-50 grid place-items-center cursor-pointer"
        >
          <motion.div
            initial={{ scale: 0, rotate: "12.5deg" }}
            animate={{ scale: 1, rotate: "0deg" }}
            exit={{ scale: 0, rotate: "0deg" }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white text-gray-700 p-10 rounded-[30px] w-full max-w-lg shadow-xl cursor-default relative h-auto"
          >
            {/* Add modal form here */}
            <div className="h-auto w-full">
              <WalletPinModalForm />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
