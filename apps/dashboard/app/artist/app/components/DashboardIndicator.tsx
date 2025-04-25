"use client";
import { getFormattedDateTime } from "@omenai/shared-utils/src/getCurrentDateTime";
type AppbarTypes = {
  artist_name: string;
};
export default function DashboardIndicator({ artist_name }: AppbarTypes) {
  return (
    <div className="w-full flex justify-between items-center">
      <div className="text-[14px]">
        <p className="font-normal text-gray-700">
          Welcome back, <strong>{artist_name}</strong>
        </p>

        <p className="text-gray-700">
          <span className="font-normal capitalize text-gray-700">
            {getFormattedDateTime()}
          </span>
        </p>
      </div>
    </div>
  );
}
