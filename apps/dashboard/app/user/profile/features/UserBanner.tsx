"use client";
import { SessionContext } from "@omenai/package-provider/SessionProvider";
import Image from "next/image";
import { useContext } from "react";
import { CiUser } from "react-icons/ci";

export const UserBanner = () => {
  const { session } = useContext(SessionContext);

  return (
    <div className="my-5 flex items-center flex-col justify-center">
      <div className="w-full flex justify-between items-center">
        <h1 className="text-fluid-sm font-semibold">Profile</h1>
        <div className="flex items-center gap-x-1 px-4 py-2 rounded-full bg-dark text-white">
          <p className="text-fluid-xs">
            Status:{" "}
            <span
              className={`${
                session?.verified ? "text-green-600" : "text-red-600"
              } font-semibold`}
            >
              {session?.verified ? "Verified" : "Not verified"}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};
