"use client";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { useContext } from "react";

export const UserBanner = () => {
  const { user } = useAuth({ requiredRole: "user" });

  return (
    <div className="my-5 flex items-center flex-col justify-center">
      <div className="w-full flex justify-between items-center">
        <h1 className="text-fluid-base font-medium">Edit Profile</h1>
        <div className="flex items-center gap-x-1 px-4 py-2 rounded-md bg-dark text-white">
          <p className="text-fluid-xxs">
            Status:{" "}
            <span
              className={`${
                user && user.verified ? "text-green-600" : "text-red-600"
              } font-medium`}
            >
              {user && user.verified ? "Verified" : "Not verified"}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};
