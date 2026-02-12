"use client";

import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { verifyGalleryRequest } from "@omenai/shared-services/verification/verifyGalleryRequest";
import { AdminAccessRoleTypes } from "@omenai/shared-types";
import { LoadSmall } from "@omenai/shared-ui-components/components/loader/Load";
import { toast_notif } from "@omenai/shared-utils/src/toast_notification";
import { useRollbar } from "@rollbar/react";
import { useEffect, useState } from "react";
import { RiAdminLine } from "react-icons/ri";

type AppbarTypes = {
  admin_name: string;
  access_role: AdminAccessRoleTypes;
};

export default function DashboardIndicator({
  admin_name,
  access_role,
}: AppbarTypes) {
  const [currentTime, setCurrentTime] = useState<string>("");
  const [greeting, setGreeting] = useState<string>("");

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
          {greeting}, <strong>{admin_name}</strong>
        </p>

        <p className="text-fluid-xxs font-medium text-dark/70">{currentTime}</p>
      </div>

      <div className="flex gap-2 items-center">
        <RiAdminLine className="text-fluid-xxs font-light text-dark" />
        <div>
          <p className="text-dark text-fluid-xxs font-bold">{admin_name}</p>
          <p className="text-dark text-fluid-xxs font-semibold">
            {access_role}
          </p>
        </div>
      </div>
    </div>
  );
}
