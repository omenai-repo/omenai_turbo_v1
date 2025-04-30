"use client";
import { blockGallery } from "@omenai/shared-services/admin/block_gallery";
import { adminModals } from "@omenai/shared-state-store/src/admin/AdminModalsStore";
import { LoadSmall } from "@omenai/shared-ui-components/components/loader/Load";
import { checkSession } from "@omenai/shared-utils/src/checkSessionValidity";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { IoCheckmarkOutline } from "react-icons/io5";
import { MdClose } from "react-icons/md";
import { toast } from "sonner";

export default function BlockGalleryConfirmationPopupModal() {
  const { blockGalleryConfirmationPopup, setBlockGalleryConfirmationPopup } =
    adminModals();
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  const router = useRouter();
  const blockGalleryVerificationMutation = async () => {
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
      setBlockGalleryConfirmationPopup({
        show: false,
        gallery_id: "",
        status: "",
      });
      router.replace("/auth/login/secure/admin");
      return;
    }
    try {
      const block_gallery = await blockGallery(
        blockGalleryConfirmationPopup.gallery_id,
        blockGalleryConfirmationPopup.status
      );
      if (block_gallery?.isOk) {
        toast.success("Operation successful", {
          description: block_gallery.message,
          style: {
            background: "green",
            color: "white",
          },
          className: "class",
        });
        queryClient.invalidateQueries({
          queryKey: ["fetch_verified_galleries"],
        });
      } else {
        toast.error("Error notification", {
          description: block_gallery?.message,
          style: {
            background: "red",
            color: "white",
          },
          className: "class",
        });
      }
      setBlockGalleryConfirmationPopup({
        show: false,
        gallery_id: "",
        status: "",
      });
      setLoading(false);
    } catch (error) {
      toast.error("Error notification", {
        description: "Something went wrong, try again or contact support",
        style: {
          background: "red",
          color: "white",
        },
        className: "class",
      });
    }
  };

  return (
    <div
      className={`${
        blockGalleryConfirmationPopup.show ? "grid" : "hidden"
      } w-full h-screen fixed top-0 left-0 backdrop-blur-lg place-items-center bg-dark/10`}
    >
      <div className="bg-white p-5 rounded-md w-[500px] text-center">
        <h1 className="text-fluid-base font-normal mb-4">Are you certain?</h1>
        <p className="text-red-600 font-bold">
          Proceed to update status for this Gallery account
        </p>

        <div className="flex gap-x-4 items-center justify-center my-5">
          <button
            onClick={blockGalleryVerificationMutation}
            disabled={loading}
            className="disabled:cursor-not-allowed disabled:bg-dark/10 flex gap-x-2 w-fit rounded-md items-center px-4 py-2.5 bg-green-600 text-white"
          >
            <span className="text-fluid-xs ">
              {loading ? <LoadSmall /> : "Confirm"}
            </span>
            <IoCheckmarkOutline />
          </button>

          <button
            onClick={() =>
              setBlockGalleryConfirmationPopup({
                show: false,
                gallery_id: "",
                status: "",
              })
            }
            className=" flex gap-x-2 w-fit rounded-md items-center px-4 py-2.5 bg-red-600 text-white"
          >
            <span className="text-fluid-xs ">Cancel</span>
            <MdClose />
          </button>
        </div>
      </div>
    </div>
  );
}
