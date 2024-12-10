"use client";

import { SessionContext } from "@omenai/package-provider/SessionProvider";
import { signOut } from "@omenai/shared-services/auth/session/deleteSession";
import { deleteAccount } from "@omenai/shared-services/requests/deleteGalleryAccount";
import { IndividualSchemaTypes } from "@omenai/shared-types";
import { LoadSmall } from "@omenai/shared-ui-components/components/loader/Load";
import { useRouter } from "next/navigation";
import { useContext, useState } from "react";
import { IoWarning } from "react-icons/io5";
import { toast } from "sonner";
import { login_url } from "@omenai/url-config/src/config";

export default function DeleteAccountConfirmationModalForm() {
  const [loading, setLoading] = useState<boolean>(false);
  const { session } = useContext(SessionContext);
  const router = useRouter();
  const auth_url = login_url();

  async function handleSignout() {
    toast.info("Signing you out...");
    const res = await signOut();

    if (res.isOk) {
      toast.info("Operation successful", {
        description: "Successfully signed out...redirecting",
      });
      router.replace(auth_url);
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
      "individual",
      (session as IndividualSchemaTypes).user_id
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
        <h2 className="text-red-600 text-x font-bold">
          You are about to delete your Omenai account!
        </h2>

        <div className="bg-[#FDF7EF] p-5 flex flex-col gap-3">
          <p className="font-bold flex items-center gap-x-2">
            <IoWarning className="text-md text-[#FFA500]" />
            <span className="text-[#FFA500] text-[14px]">Warning</span>
          </p>

          <p className="text-xs">
            Deleting your account will permanently erase all your data on the
            platform and prevent you from using any of the platform&apos;s
            features. <br />
            Please be advised that all artworks you have ordered and paid for
            prior to confirming this action will still be delivered to your
            address. <br />
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
          className="h-[40px] px-4 w-full text-xs text-white disabled:cursor-not-allowed disabled:bg-[#E0E0E0] hover:bg-red-500 bg-red-600 duration-300 grid place-items-center"
        >
          {loading ? <LoadSmall /> : "I understand, delete this account"}
        </button>
      </div>
    </div>
  );
}
