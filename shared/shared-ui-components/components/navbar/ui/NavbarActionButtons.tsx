"use client";

import Link from "next/link";
import { GoHome } from "react-icons/go";
import { BiUser } from "react-icons/bi";
import { auth_uri } from "@omenai/url-config/src/config";

export default function NavbarActionButtons() {
  const login_base_url = auth_uri();
  return (
    <div>
      <Link href={`${login_base_url}/login`} className="w-fit lg:hidden block">
        <BiUser className="text-sm" />
      </Link>
      <div className="hidden lg:flex flex-row sm:space-x-4 space-x-2 w-fit text-[14px] sm:text-[14px] ml-2">
        <Link
          href={`${login_base_url}/login`}
          className="h-[35px] whitespace-nowrap rounded-full px-5 flex items-center gap-x-2 text-[14px] font-normal hover:border-dark bg-white border border-dark/50 text-gray-700 duration-200"
        >
          Login
          <GoHome className="text-gray-700" />
        </Link>

        <Link
          href={`${login_base_url}/register`}
          className="h-[35px] whitespace-nowrap rounded-full grid place-items-center px-5 text-[14px] font-normal bg-dark hover:bg-dark/80 text-white ring-1 ring-dark/10 duration-200"
        >
          Create an account
        </Link>
      </div>
    </div>
  );
}
