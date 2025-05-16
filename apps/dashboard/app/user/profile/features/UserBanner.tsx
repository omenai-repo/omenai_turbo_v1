"use client";
import { SessionContext } from "@omenai/package-provider/SessionProvider";
import { useContext } from "react";

export const UserBanner = () => {
  const { session } = useContext(SessionContext);

  return (
    <div className="my-5 flex items-center flex-col justify-center">
      <div className="w-full flex justify-between items-center">
        <h1 className="text-fluid-base font-medium">Edit Profile</h1>
        <div className="flex items-center gap-x-1 px-4 py-2 rounded-full bg-dark text-white">
          <p className="text-fluid-xxs">
            Status:{" "}
            <span
              className={`${
                session?.verified ? "text-green-600" : "text-red-600"
              } font-medium`}
            >
              {session?.verified ? "Verified" : "Not verified"}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};
