"use client";

import { deleteAccount } from "@omenai/shared-services/requests/deleteGalleryAccount";
import { LoadSmall } from "@omenai/shared-ui-components/components/loader/Load";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { IoWarning } from "react-icons/io5";
import { toast } from "sonner";
import { auth_uri } from "@omenai/url-config/src/config";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";

export default function DeleteAccountConfirmationModalForm() {
  const [loading, setLoading] = useState<boolean>(false);
  const { user } = useAuth({ requiredRole: "user" });

  const router = useRouter();

  async function handleSignOut() {
    toast.info("Signing out...", {
      description: "You will be redirected to the login page",
      style: {
        background: "blue",
        color: "white",
      },
      className: "class",
    });

    router.replace(`${auth_uri}/login`);
  }

  async function handleDeleteGalleryAccount() {
    setLoading(true);
    const response = await deleteAccount("individual", user.id);

    if (response?.isOk) {
      toast.success("Operation successful", {
        description: response.message,
        style: {
          background: "green",
          color: "white",
        },
        className: "class",
      });
      await handleSignOut();
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
      <h1 className="text-fluid-sm font-bold mb-4 text-dark">
        Confirm Account Deletion
      </h1>
      <div className="flex flex-col gap-4 font-normal text-fluid-base">
        <h2 className="text-red-600 text-x font-bold">
          You are about to delete your Omenai account!
        </h2>

        <div className="bg-[#FDF7EF] p-5 flex flex-col gap-3">
          <p className="font-bold flex items-center gap-x-2">
            <IoWarning className="text-fluid-md text-red-600" />
            <span className="text-red-600 text-fluid-xs">Warning</span>
          </p>

          <p className="text-fluid-xs font-medium">
            Deleting your account will permanently erase all your data on the
            platform and prevent you from using any of the platform&apos;s
            features. <br />
            Please be advised that all artworks you have ordered and paid for
            prior to confirming this action will still be delivered to your
            address and no refunds will be issued for outstanding orders.
          </p>
          <strong className="text-red-600">
            This action is not reversible!
          </strong>
        </div>
      </div>

      <div className="w-full mt-5 flex items-center gap-x-2">
        <button
          disabled={loading}
          type="button"
          onClick={handleDeleteGalleryAccount}
          className="h-[35px] p-5 rounded-full w-full flex items-center justify-center gap-3 disabled:cursor-not-allowed disabled:bg-dark/10 disabled:text-[#A1A1A1] bg-dark text-white text-fluid-xs font-normal"
        >
          {loading ? <LoadSmall /> : "I understand, delete this account"}
        </button>
      </div>
    </div>
  );
}
