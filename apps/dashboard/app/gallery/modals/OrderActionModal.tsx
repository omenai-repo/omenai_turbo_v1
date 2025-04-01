"use client";
import { AnimatePresence, motion } from "framer-motion";
import ShippingQuoteModalDataForm from "./OrderActionModalForm";
import { actionStore } from "@omenai/shared-state-store/src/actions/ActionStore";

export const OrderActionModal = () => {
  const {
    openGalleryOrderActionModal,
    toggleGalleryOrderActionModal,
    clearGalleryOrderActionModalData,
  } = actionStore();

  return (
    <AnimatePresence key={10}>
      {openGalleryOrderActionModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            toggleGalleryOrderActionModal(false);
            clearGalleryOrderActionModalData();
          }}
          className="bg-slate-900/20 backdrop-blur py-8 px-2 fixed inset-0 z-50 grid place-items-center cursor-pointer"
        >
          <motion.div
            initial={{ scale: 0, rotate: "12.5deg" }}
            animate={{ scale: 1, rotate: "0deg" }}
            exit={{ scale: 0, rotate: "0deg" }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white text-gray-700 p-6 rounded-lg w-full max-w-lg shadow-xl cursor-default relative  overflow-y-scroll"
          >
            <h1 className="text-base font-bold mb-5">Order Request Details</h1>
            {/* Add modal form here */}
            <div className="h-auto w-full">
              <ShippingQuoteModalDataForm />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
