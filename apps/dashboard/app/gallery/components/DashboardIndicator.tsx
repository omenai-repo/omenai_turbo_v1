"use client";

import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { verifyGalleryRequest } from "@omenai/shared-services/verification/verifyGalleryRequest";
import { LoadSmall } from "@omenai/shared-ui-components/components/loader/Load";
import { toast_notif } from "@omenai/shared-utils/src/toast_notification";
import { useRollbar } from "@rollbar/react";
import { useEffect, useState } from "react";
import { RiAdminLine } from "react-icons/ri";

type AppbarTypes = {
  gallery_name: string;
  admin_name: string;
  gallery_verified: boolean;
};

export default function DashboardIndicator({
  gallery_name,
  admin_name,
  gallery_verified,
}: AppbarTypes) {
  const [currentTime, setCurrentTime] = useState<string>("");
  const [greeting, setGreeting] = useState<string>("");
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
          "error",
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
        "error",
      );
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();

      // Format time
      const formatted = now.toLocaleString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      setCurrentTime(formatted);

      // Determine greeting
      const hour = now.getHours();

      if (hour >= 5 && hour < 12) {
        setGreeting("Good morning");
      } else if (hour >= 12 && hour < 17) {
        setGreeting("Good afternoon");
      } else if (hour >= 17 && hour < 21) {
        setGreeting("Good evening");
      } else {
        setGreeting("Have a lovely night rest");
      }
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full flex justify-between items-center">
      <div className="space-y-1">
        <p className="text-fluid-xxs text-dark font-light">
          {greeting}, <strong>{gallery_name}</strong>
        </p>

        <p className="text-fluid-xxs font-medium text-dark/70">{currentTime}</p>
      </div>
      {!gallery_verified ? (
        <div className="space-y-1" id="gallery-verification">
          <button
            disabled={loading}
            onClick={handleRequestGalleryVerification}
            className=" h-[35px] p-5 rounded w-full flex items-center justify-center gap-3 disabled:cursor-not-allowed disabled:bg-dark/10 disabled:text-[#A1A1A1] bg-dark text-white text-fluid-xxs font-light"
          >
            {loading ? <LoadSmall /> : "Send Verification Reminder"}
          </button>
          <p className="text-fluid-xxs text-dark font-light">
            Account currently under review
          </p>
        </div>
      ) : (
        <div className="flex gap-2 items-center">
          <RiAdminLine className="text-fluid-xxs font-light text-dark" />
          <div>
            <p className="text-dark text-fluid-xxs font-light">
              {admin_name} (Admin)
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
