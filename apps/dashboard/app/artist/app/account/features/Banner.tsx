"use client";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { AddressTypes } from "@omenai/shared-types";
import Image from "next/image";
import React from "react";
import { RxAvatar } from "react-icons/rx";

export const ProfileBanner = () => {
  const { user } = useAuth({ requiredRole: "artist" });

  const logo = user.logo;

  return (
    <div className="my-5 mx-5 lg:mx-0 flex items-center flex-col justify-center">
      <Image
        src={"/images/1.jpg"}
        alt="user banner"
        width={6000}
        height={4000}
        className="w-full h-[200px] object-fill object-center rounded-2xl overflow-hidden"
      />

      <div className="py-[1.5rem] bg-gray-400 rounded-xl w-[95%] -mt-10 xs:px-5 flex  xs:flex-row flex-col items-center justify-between">
        <div className="flex gap-3">
          {logo !== "" ? (
            <Image
              src={logo}
              alt="user avatar"
              width={45}
              height={45}
              className="rounded-full overflow-hidden"
            />
          ) : (
            <RxAvatar />
          )}

          <div className="">
            <p className="text-dark font-normal text-fluid-base">{user.name}</p>
            <p className="text-dark text-fluid-xs font-light">
              {typeof user.address === "object" && user.address !== null
                ? (user.address as AddressTypes).address_line
                : ""}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-[1rem] xs:mt-0">
          <Image
            src="/icons/status.png"
            alt="icon"
            width={24}
            height={24}
            className=""
          />

          <p className="">
            Status:{" "}
            <span
              className={`${
                user.artist_verified ? "text-green-600" : "text-red-600"
              }`}
            >
              {user.artist_verified ? "Verified" : "Not verified"}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};
