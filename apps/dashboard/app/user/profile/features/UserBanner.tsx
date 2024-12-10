"use client";
import { SessionContext } from "@omenai/package-provider/SessionProvider";
import Image from "next/image";
import { useContext } from "react";
import { CiUser } from "react-icons/ci";

export const UserBanner = () => {
  const { session } = useContext(SessionContext);

  return (
    <div className="my-5 mx-5 lg:mx-0 flex items-center flex-col justify-center">
      <div className="py-[1.5rem] bg-[#FAFAFA] w-full xs:px-5 flex  xs:flex-row flex-col items-center justify-between">
        <div className="flex gap-3 items-center">
          <div className="p-2 xs:p-4 md:p-8 rounded-full bg-dark/5">
            <CiUser className="" />
          </div>

          <div className="">
            <p className="text-dark font-normal text-[15px]">{session?.name}</p>
            <p className="text-[#858585] text-xs font-light">
              {session?.email}
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

          <p className="text-xs">
            Status:{" "}
            <span
              className={`${
                session?.verified ? "text-green-600" : "text-red-600"
              }`}
            >
              {session?.verified ? "Verified" : "Not verified"}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};
