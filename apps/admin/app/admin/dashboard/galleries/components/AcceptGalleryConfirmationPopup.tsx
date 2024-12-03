"use client";
import { acceptGalleryVerification } from "@omenai/shared-services/admin/accept_gallery_verification";
import { adminModals } from "@omenai/shared-state-store/src/admin/AdminModalsStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { IoCheckmarkOutline } from "react-icons/io5";
import { MdClose } from "react-icons/md";
import { toast } from "sonner";

export default function AcceptConfirmationPopupModal() {
  const { acceptConfirmationPopup, setAcceptConfirmationPopup } = adminModals();
  const queryClient = useQueryClient();

  const acceptGalleryVerificationMutation = useMutation({
    mutationFn: async () => {
      const accept_gallery = await acceptGalleryVerification(
        acceptConfirmationPopup.gallery_id,
        acceptConfirmationPopup.name,
        acceptConfirmationPopup.email
      );
      if (accept_gallery?.isOk) {
        toast.success("Operation successful", {
          description: accept_gallery.message,
          style: {
            background: "green",
            color: "white",
          },
          className: "class",
        });
      } else {
        toast.error("Error notification", {
          description: accept_gallery?.message,
          style: {
            background: "red",
            color: "white",
          },
          className: "class",
        });
      }
      setAcceptConfirmationPopup({
        show: false,
        gallery_id: "",
        name: "",
        email: "",
      });
      return accept_gallery?.isOk;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["fetch_non_verified_galleries"],
      });
    },
  });

  return (
    <div
      className={`${
        acceptConfirmationPopup.show ? "grid" : "hidden"
      } w-full h-screen fixed top-0 left-0 backdrop-blur-lg place-items-center bg-dark/10`}
    >
      <div className="bg-white p-5 rounded-md w-[500px] text-center">
        <h1 className="text-base font-normal mb-4">Are you certain?</h1>
        <p className="text-red-600 font-bold">
          Proceed to verify this Gallery account
        </p>

        <div className="flex gap-x-4 items-center justify-center my-5">
          <button
            onClick={() => acceptGalleryVerificationMutation.mutate()}
            disabled={acceptGalleryVerificationMutation.isPending}
            className="disabled:cursor-not-allowed disabled:bg-dark/10 flex gap-x-2 w-fit rounded-md items-center px-4 py-2.5 bg-green-600 text-white"
          >
            <span className="text-xs ">Confirm</span>
            <IoCheckmarkOutline />
          </button>

          <button
            onClick={() =>
              setAcceptConfirmationPopup({
                show: false,
                gallery_id: "",
                name: "",
                email: "",
              })
            }
            className=" flex gap-x-2 w-fit rounded-md items-center px-4 py-2.5 bg-red-600 text-white"
          >
            <span className="text-xs ">Cancel</span>
            <MdClose />
          </button>
        </div>
      </div>
    </div>
  );
}
