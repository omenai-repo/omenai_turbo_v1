"use client";

import { artistActionStore } from "@omenai/shared-state-store/src/artist/actions/ActionStore";
import WalletPinModalForm from "./WalletPinModalForm";
import { AnimatePresence, motion } from "framer-motion";

export const WalletPinModal = () => {
  const { walletPinPopup } = artistActionStore();

  return (
    // Removed hardcoded key={13} as it's unnecessary unless toggling multiple components
    <AnimatePresence>
      {walletPinPopup && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 15 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          // Changed from a centered grid box to a fixed full-screen overlay
          className="fixed inset-0 z-[100] h-[100dvh] w-full overflow-hidden bg-white"
        >
          {/* Since this wrapper is now the full-screen container, 
            the WalletPinModalForm will perfectly fill this space.
          */}
          <WalletPinModalForm />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
