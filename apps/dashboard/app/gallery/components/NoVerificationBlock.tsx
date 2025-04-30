"use client";
import { verifyGalleryRequest } from "@omenai/shared-services/verification/verifyGalleryRequest";
import { useState } from "react";
import { toast } from "sonner";
import { BsShieldLock } from "react-icons/bs";
import { LoadSmall } from "@omenai/shared-ui-components/components/loader/Load";
export default function NoVerificationBlock({
  gallery_name,
}: {
  gallery_name: string;
}) {
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
    <div
      className={`w-full h-[78vh] grid place-items-center bg-dark mt-10 rounded-[20px]`}
    >
      <div className="flex flex-col gap-4 items-center text-[14px]">
        <BsShieldLock className="text-2xl text-white" />
        <div className="text-center">
          <p className=" text-white text-[14px]">
            Your account is being verified, an agent will reach out to you
            within 24 hours.
          </p>
          <p className=" text-white">
            To expedite this process, please click the{" "}
            <b>&apos; Send Verification Reminder &apos;</b> button below{" "}
          </p>
        </div>
        <div className="mt-3" id="gallery-verification">
          <button
            disabled={loading}
            onClick={handleRequestGalleryVerification}
            className=" h-[35px] p-5 rounded-full w-full flex items-center justify-center gap-3 disabled:cursor-not-allowed disabled:bg-dark/10 disabled:text-[#A1A1A1] bg-white text-gray-700 hover:bg-[#e0e0e0] duration-300 text-[14px] font-normal"
          >
            {loading ? <LoadSmall /> : "Send Verification Reminder"}
          </button>
        </div>
      </div>
    </div>
  );
}
