"use client";

import { useState } from "react";
import { toast } from "sonner";
import { RiAdminLine } from "react-icons/ri";
import { verifyGalleryRequest } from "@omenai/shared-services/verification/verifyGalleryRequest";
import { LoadSmall } from "@omenai/shared-ui-components/components/loader/Load";
import { getFormattedDateTime } from "@omenai/shared-utils/src/getCurrentDateTime";
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
  const [loading, setLoading] = useState(false);
  async function handleRequestGalleryVerification() {
    setLoading(true);
    try {
      const response = await verifyGalleryRequest(gallery_name!);
      if (!response?.isOk)
        toast.error("Error notification", {
          description: response?.message,
          style: {
            background: "red",
            color: "white",
          },
          className: "class",
        });
      else
        toast.success("Operation successful", {
          description: response.message,
          style: {
            background: "green",
            color: "white",
          },
          className: "class",
        });
    } catch (error) {
      toast.error("Error notification", {
        description: "Something wwent wrong. Please try again",
        style: {
          background: "red",
          color: "white",
        },
        className: "class",
      });
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="w-full flex justify-between items-center">
      <div className="text-xs">
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
            className=" w-full text-xs disabled:cursor-not-allowed whitespace-nowrap disabled:bg-[#E0E0E0] bg-dark rounded-sm text-white h-[40px] px-4 flex gap-x-2 items-center justify-center hover:bg-dark/80"
          >
            {loading ? <LoadSmall /> : "Send Verification Reminder"}
          </button>
          <p className="text-xs text-[#858585]">
            Account currently under review
          </p>
        </div>
      ) : (
        <div className="flex gap-2 items-center">
          <RiAdminLine className="text-sm font-light text-dark" />
          <div>
            <p className="text-dark text-xs font-bold">{admin_name}</p>
            {/* <p className="text-dark text-xs">{gallery_name}</p> */}
          </div>
        </div>
      )}
    </div>
  );
}
