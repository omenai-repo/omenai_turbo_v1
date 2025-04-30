"use client";

import { AnimatePresence, motion } from "framer-motion";
import { adminModals } from "@omenai/shared-state-store/src/admin/AdminModalsStore";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { LoadSmall } from "@omenai/shared-ui-components/components/loader/Load";
import { editorial_database } from "@omenai/appwrite-config";
import { checkSession } from "@omenai/shared-utils/src/checkSessionValidity";

export const DeleteEditorialModal = () => {
  const router = useRouter();
  const {
    setShowDeleteEditorialModal,
    showDeleteEditorialModal,
    showDeleteEditorialId,
  } = adminModals();

  const [loading, setLoading] = useState<boolean>(false);

  const handleEditorialDelete = async () => {
    setLoading(true);
    const session = await checkSession();

    if (!session) {
      toast.error("Error notification", {
        description: "Admin session expired. Please login again",
        style: {
          background: "red",
          color: "white",
        },
        className: "class",
      });
      setShowDeleteEditorialModal(false, "");
      router.replace("/auth/login/secure/admin");
      return;
    }

    const response = await editorial_database.deleteDocument(
      process.env.NEXT_PUBLIC_APPWRITE_EDITORIAL_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_EDITORIAL_COLLECTION_ID!,
      showDeleteEditorialId
    );

    if (response) {
      toast.success("Operation successful", {
        description: "Editorial deleted successfully",
        style: {
          background: "green",
          color: "white",
        },
        className: "class",
      });

      // router.refresh();
      setShowDeleteEditorialModal(false, "");
      setLoading(false);
      window.location.reload();
    }
  };

  return (
    <AnimatePresence key={30}>
      {showDeleteEditorialModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            setShowDeleteEditorialModal(false, "");
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
              <h1>Are you sure you want to delete editorial?</h1>
              <div className="flex items-center gap-5 mt-10">
                <button
                  disabled={loading}
                  onClick={handleEditorialDelete}
                  className="h-[35px] px-4 w-full text-fluid-xs text-white disabled:cursor-not-allowed disabled:bg-dark/10 hover:bg-dark/80 bg-dark duration-300 grid place-items-center"
                >
                  {loading ? <LoadSmall /> : "Delete editorial"}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
