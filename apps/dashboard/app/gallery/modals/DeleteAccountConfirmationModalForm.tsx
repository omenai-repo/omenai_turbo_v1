"use client";

import { SessionContext } from "@omenai/package-provider/SessionProvider";
import { signOut } from "@omenai/shared-services/auth/session/deleteSession";
import { deleteAccount } from "@omenai/shared-services/requests/deleteGalleryAccount";
import { GallerySchemaTypes } from "@omenai/shared-types";
import { LoadSmall } from "@omenai/shared-ui-components/components/loader/Load";
import { useRouter } from "next/navigation";
import { useContext, useState } from "react";
import { IoWarning } from "react-icons/io5";
import { toast } from "sonner";
import { auth_uri } from "@omenai/url-config/src/config";

export default function DeleteAccountConfirmationModalForm() {
  const [loading, setLoading] = useState<boolean>(false);
  const { session } = useContext(SessionContext);
  const router = useRouter();
  const auth_url = auth_uri();
  async function handleSignout() {
    toast.info("Signing you out...");
    const res = await signOut();

    if (res.isOk) {
      toast.info("Operation successful", {
        description: "Successfully signed out...redirecting",
      });
      router.replace(`${auth_url}/login`);
    } else {
      toast.error("Operation successful", {
        description:
          "Something went wrong, please try again or contact support",
      });
    }
  }
  async function handleDeleteGalleryAccount() {
    setLoading(true);
    const response = await deleteAccount(
      "gallery",
      (session as GallerySchemaTypes).gallery_id
    );

    if (response?.isOk) {
      toast.success("Operation successful", {
        description: response.message,
        style: {
          background: "green",
          color: "white",
        },
        className: "class",
      });
      await handleSignout();
    } else {
      toast.error("Error notification", {
        description: response?.message,
        style: {
          background: "red",
          color: "white",
        },
        className: "class",
      });
    }
    setLoading(false);
  }
  return (
    <div>
      <h1 className="text-sm font-normal mb-4 text-dark">
        Confirm Account Deletion
      </h1>
      <div className="flex flex-col gap-4 font-normal text-base">
        <h2 className="text-red-600 text-base font-bold">
          You are about to delete your Gallery account!
        </h2>

        <div className="bg-[#FDF7EF] p-5 flex flex-col gap-3">
          <p className="font-bold flex items-center gap-x-2">
            <IoWarning className="text-md text-[#FFA500]" />
            <span className="text-[#FFA500] text-[14px]">Warning</span>
          </p>

          <p className="text-[14px] text-dark">
            Deleting your account will permanently erase all your uploaded
            artwork and prevent you from using any of the platform&apos;s
            features.{" "}
            <strong className="text-red-600">
              This action is not reversible!
            </strong>
          </p>
        </div>
      </div>

      <div className="w-full mt-5 flex items-center gap-x-2">
        <button
          disabled={loading}
          type="button"
          onClick={handleDeleteGalleryAccount}
          className="h-[40px] p-6 rounded-full w-full flex items-center justify-center gap-3 disabled:cursor-not-allowed disabled:bg-gray-400 disabled:text-[#A1A1A1] bg-red-600 hover:bg-red-500 text-white text-[14px] font-normal"
        >
          {loading ? <LoadSmall /> : "I understand, delete this account"}
        </button>
      </div>
    </div>
  );
}
