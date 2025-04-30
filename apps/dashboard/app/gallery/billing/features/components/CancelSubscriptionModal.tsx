"use client";

import { cancelSubscription } from "@omenai/shared-services/subscriptions/cancelSubscription";
import { galleryModalStore } from "@omenai/shared-state-store/src/gallery/gallery_modals/GalleryModals";
import { LoadSmall } from "@omenai/shared-ui-components/components/loader/Load";
import { formatIntlDateTime } from "@omenai/shared-utils/src/formatIntlDateTime";

import { useQueryClient } from "@tanstack/react-query";
import { Modal } from "flowbite-react";
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

  const [loading, setLoading] = useState(false);

  const cancel_subscription = async () => {
    setLoading(true);
    const response = await cancelSubscription(id);

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
      <AnimatePresence key={8}>
        {openModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              updateOpenModal();
            }}
            className="bg-slate-900/20 backdrop-blur-2xl py-8 px-2 fixed inset-0 z-50 grid place-items-center cursor-pointer"
          >
            <motion.div
              initial={{ scale: 0, rotate: "12.5deg" }}
              animate={{ scale: 1, rotate: "0deg" }}
              exit={{ scale: 0, rotate: "0deg" }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white text-gray-700 p-6 rounded-3xl w-full max-w-lg shadow-xl cursor-default relative h-auto"
            >
              {/* Add modal form here */}
              <div className="h-auto w-full">
                <div className="flex flex-col gap-4 font-normal text-[14px]">
                  <h2 className="text-red-600 text-base font-bold">
                    You are about to cancel your subscription.
                  </h2>
                  <p>
                    Your current subscription will remain active till{" "}
                    <span className="font-bold text-[14px]">
                      {formatIntlDateTime(sub_end)}.
                    </span>{" "}
                    If you would like to proceed with canceling your
                    subscription, please select{" "}
                    <strong>&apos;Cancel subscription&apos;</strong>
                    below.
                  </p>

                  {/* Warning block */}
                  <div className="bg-[#FDF7EF] p-5 flex flex-col gap-3 text-[14px]">
                    <IoWarning className="text-md text-[#ff3434]" />
                    <p className="font-medium">
                      Are you sure? After{" "}
                      <span className="font-bold">
                        {formatIntlDateTime(sub_end)}
                      </span>
                      , you will be unable to upload artworks and events or use
                      any of the services provided by Omenai Inc. All artworks
                      uploaded will be suspended until your subscriptions are
                      restarted.
                    </p>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end mt-8">
                  <div className="flex gap-3 text-[15px]">
                    <button
                      disabled={loading}
                      className=" h-[35px] px-4 rounded-full text-white disabled:cursor-not-allowed text-[13px] bg-dark hover:bg-dark/90 duration-200"
                      onClick={() => updateOpenModal()}
                    >
                      Close
                    </button>
                    <button
                      disabled={loading}
                      className=" h-[35px] px-4 text-white rounded-full disabled:cursor-not-allowed text-[13px] bg-red-600 hover:bg-red-600/90 duration-200"
                      color="gray"
                      onClick={cancel_subscription}
                    >
                      {loading ? <LoadSmall /> : "Cancel Subscription"}
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
