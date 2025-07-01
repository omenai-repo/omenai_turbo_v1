"use client";
import { getFormattedDateTime } from "@omenai/shared-utils/src/getCurrentDateTime";
import { ShieldUser } from "lucide-react";
type AppbarTypes = {
  admin_name?: string;
};
export default function DashboardIndicator({ admin_name }: AppbarTypes) {
  return (
    <div className="w-full flex justify-between items-center">
      <div className="text-fluid-xs">
        <p className="font-normal text-dark">
          Welcome back, <strong>{admin_name}</strong>
        </p>

        <p className="text-dark">
          <span className="font-normal capitalize text-dark">
            {getFormattedDateTime()}
          </span>
        </p>
      </div>
      {/* Request verification */}

      <div className="flex gap-2 items-center">
        <ShieldUser
          size={20}
          strokeWidth={1.5}
          absoluteStrokeWidth
          className="text-fluid-xs font-light text-dark"
        />
        <div>
          <p className="text-dark text-fluid-xxs font-bold">{admin_name}</p>
          <p className="text-dark text-fluid-xxs font-semibold">Admin</p>
        </div>
      </div>
    </div>
  );
}
