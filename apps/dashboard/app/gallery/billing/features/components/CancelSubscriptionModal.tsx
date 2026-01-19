"use client";

import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { cancelSubscription } from "@omenai/shared-services/subscriptions/cancelSubscription";
import { galleryModalStore } from "@omenai/shared-state-store/src/gallery/gallery_modals/GalleryModals";
import { LoadSmall } from "@omenai/shared-ui-components/components/loader/Load";
import { formatIntlDateTime } from "@omenai/shared-utils/src/formatIntlDateTime";
import { useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { IoWarning } from "react-icons/io5";
import { toast } from "sonner";
export default function CancelSubscriptionModal({
  sub_end,
  id,
}: {
  sub_end: Date;
  id: string;
}) {
  const router = useRouter();
  const { openModal, updateOpenModal } = galleryModalStore();

  const query_client = useQueryClient();

  const { csrf } = useAuth({ requiredRole: "gallery" });
  const [loading, setLoading] = useState(false);

  const cancel_subscription = async () => {
    setLoading(true);
    const response = await cancelSubscription(id, csrf || "");

    if (response?.isOk) {
      setLoading(false);
      query_client.invalidateQueries({ queryKey: ["subscription_precheck"] });
      toast.success("Operation successful", {
        description: response.message,
        style: {
          background: "green",
          color: "white",
        },
        className: "class",
      });
      updateOpenModal();
      router.refresh();
    }
  };

  return (
    <>
      <AnimatePresence>
        {openModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => updateOpenModal()}
            className="bg-slate-900/60 backdrop-blur-md fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md"
            >
              {/* Design 1: Clean Warning Modal */}
              <div className="bg-white rounded shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="bg-red-50 px-6 py-5 border-b border-red-100">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-red-100 rounded">
                      <svg
                        className="w-6 h-6 text-red-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h2 className="text-lg font-semibold text-slate-900">
                        Cancel Subscription
                      </h2>
                      <p className="text-sm text-slate-600 mt-1">
                        This action cannot be undone
                      </p>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  <div className="space-y-3">
                    <p className="text-sm text-slate-700">
                      Your subscription will remain active until:
                    </p>
                    <div className="bg-slate-100 rounded px-4 py-3">
                      <p className="font-semibold text-slate-900">
                        {formatIntlDateTime(sub_end)}
                      </p>
                    </div>
                  </div>

                  {/* Warning Box */}
                  <div className="bg-amber-50 border border-amber-200 rounded p-4">
                    <div className="flex gap-3">
                      <IoWarning className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-amber-900">
                          What happens after cancellation:
                        </p>
                        <ul className="text-sm text-amber-800 space-y-1 ml-4">
                          <li className="flex items-start gap-2">
                            <span className="text-amber-600 mt-1">•</span>
                            <span>Unable to upload new artworks or events</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-amber-600 mt-1">•</span>
                            <span>Existing artworks will be suspended</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-amber-600 mt-1">•</span>
                            <span>Loss of access to premium features</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="bg-slate-50 px-6 py-4 border-t border-slate-200">
                  <div className="flex gap-3 justify-end">
                    <button
                      onClick={() => updateOpenModal()}
                      disabled={loading}
                      className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Keep Subscription
                    </button>
                    <button
                      onClick={cancel_subscription}
                      disabled={loading}
                      className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {loading ? <LoadSmall /> : "Yes, Cancel"}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
