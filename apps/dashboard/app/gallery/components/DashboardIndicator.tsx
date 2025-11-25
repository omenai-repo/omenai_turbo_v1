"use client";
import { useState } from "react";
import { toast } from "sonner";
import { RiAdminLine } from "react-icons/ri";
import { verifyGalleryRequest } from "@omenai/shared-services/verification/verifyGalleryRequest";
import { LoadSmall } from "@omenai/shared-ui-components/components/loader/Load";
import { getFormattedDateTime } from "@omenai/shared-utils/src/getCurrentDateTime";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { useRollbar } from "@rollbar/react";
import { toast_notif } from "@omenai/shared-utils/src/toast_notification";
type AppbarTypes = {
  admin_name?: string;
  gallery_name?: string;
  gallery_verified?: boolean;
};
export default function DashboardIndicator({
  admin_name,
  gallery_name,
  gallery_verified,
}: AppbarTypes) {
  const { csrf } = useAuth();
  const [loading, setLoading] = useState(false);
  const rollbar = useRollbar();
  async function handleRequestGalleryVerification() {
    setLoading(true);
    try {
      const response = await verifyGalleryRequest(gallery_name!, csrf || "");
      if (!response?.isOk)
        toast_notif(
          response.message ||
            "An error was encountered, please try again later or contact support",
          "error"
        );
      else
        toast_notif(response.message || "Verification request sent", "success");
    } catch (error) {
      if (error instanceof Error) {
        rollbar.error(error);
      } else {
        rollbar.error(new Error(String(error)));
      }
      toast_notif(
        "An error was encountered, please try again later or contact support",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="w-full flex justify-between items-center">
      <div className="text-fluid-xxs">
        <p className="font-normal text-dark">
          Welcome back, <strong>{gallery_name}</strong>
        </p>

        <p className="text-dark">
          <span className="font-normal capitalize text-dark">
            {getFormattedDateTime()}
          </span>
        </p>
      </div>
      {/* Request verification */}
      {!gallery_verified ? (
        <div className="space-y-1" id="gallery-verification">
          <button
            disabled={loading}
            onClick={handleRequestGalleryVerification}
            className=" h-[35px] p-5 rounded w-full flex items-center justify-center gap-3 disabled:cursor-not-allowed disabled:bg-dark/10 disabled:text-[#A1A1A1] bg-dark text-white text-fluid-xxs font-normal"
          >
            {loading ? <LoadSmall /> : "Send Verification Reminder"}
          </button>
          <p className="text-fluid-xxs text-dark font-normal">
            Account currently under review
          </p>
        </div>
      ) : (
        <div className="flex gap-2 items-center">
          <RiAdminLine className="text-fluid-xxs font-light text-dark" />
          <div>
            <p className="text-dark text-fluid-xxs font-normal">
              {admin_name} (Admin)
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
