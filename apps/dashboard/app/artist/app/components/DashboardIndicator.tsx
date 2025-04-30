"use client";
import { getFormattedDateTime } from "@omenai/shared-utils/src/getCurrentDateTime";
type AppbarTypes = {
  artist_name: string;
};
export default function DashboardIndicator({ artist_name }: AppbarTypes) {
  return (
    <div className="w-full flex justify-between items-center">
      <div className="text-fluid-xs">
        <p className="font-normal text-dark">
          Welcome back, <strong>{artist_name}</strong>
        </p>

        <p className="text-dark">
          <span className="font-normal capitalize text-dark">
            {getFormattedDateTime()}
          </span>
        </p>
      </div>
    </div>
  );
}
