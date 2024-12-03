"use client";
import { AnimatePresence, motion } from "framer-motion";
import UpdatePromotionalModalForm from "./UpdatePromotionalModalForm";
import { promotionalStore } from "@omenai/shared-state-store/src/promotionals/PromotionalStore";
export const UpdatePromotionalModal = () => {
  const { setOpenModal, openModal } = promotionalStore();

  return (
    <AnimatePresence key={30}>
      {openModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            setOpenModal(false);
          }}
          className="bg-slate-900/20 backdrop-blur py-8 px-2 fixed inset-0 z-50 grid place-items-center cursor-pointer"
        >
          <motion.div
            initial={{ scale: 0, rotate: "12.5deg" }}
            animate={{ scale: 1, rotate: "0deg" }}
            exit={{ scale: 0, rotate: "0deg" }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white text-dark p-6 rounded-lg w-full max-w-lg shadow-xl cursor-default relative h-auto"
          >
            {/* Add modal form here */}
            <div className="h-auto w-full">
              <UpdatePromotionalModalForm />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
