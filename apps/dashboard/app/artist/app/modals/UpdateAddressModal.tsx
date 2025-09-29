"use client";
import { AnimatePresence, motion } from "framer-motion";

import { artistActionStore } from "@omenai/shared-state-store/src/artist/actions/ActionStore";
import UpdateAddressModalForm from "./UpdateAddressModalForm";

export const UpdateAddressModal = () => {
  const { updateAddressModalPopup, addressModalPopup } = artistActionStore();

  return (
    <AnimatePresence key={8}>
      {addressModalPopup && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            updateAddressModalPopup(false);
          }}
          className="bg-slate-900/20 backdrop-blur p-2 fixed inset-0 z-50 grid place-items-center cursor-pointer"
        >
          <motion.div
            initial={{ scale: 0, rotate: "12.5deg" }}
            animate={{ scale: 1, rotate: "0deg" }}
            exit={{ scale: 0, rotate: "0deg" }}
            onClick={(e) => e.stopPropagation()}
            className=" text-dark p-6 rounded w-full max-w-lg cursor-default relative h-auto"
          >
            {/* Add modal form here */}
            <div className="h-auto w-full">
              <UpdateAddressModalForm />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
