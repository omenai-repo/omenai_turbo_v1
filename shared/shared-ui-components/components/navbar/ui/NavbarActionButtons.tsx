"use client";

import Link from "next/link";
import { GoHome } from "react-icons/go";
import { BiUser } from "react-icons/bi";
import { login_url } from "@omenai/url-config/src/config";

export default function NavbarActionButtons() {
  const login_base_url = login_url();
  return (
    <div>
      <Link href={login_base_url} className="w-fit lg:hidden block">
        <BiUser className="text-sm" />
      </Link>
      {/* <div className="lg:block hidden">
        <button className="h-[40px] whitespace-nowrap px-5 flex items-center bg-dark gap-x-2 text-xs font-normal hover:border-dark  border border-dark/10 text-dark duration-200">
          Hello me
        </button>
      </div> */}
      <div className="hidden lg:flex flex-row sm:space-x-4 space-x-2 w-fit text-xs sm:text-[14px] ml-2">
        <Link
          href={login_base_url}
          className="h-[40px] whitespace-nowrap px-5 flex items-center gap-x-2 text-xs font-normal hover:border-dark bg-white border border-dark/10 text-dark duration-200"
        >
          Login
          <GoHome className="text-dark" />
        </Link>

        <Link
          href={login_base_url}
          className="h-[40px] whitespace-nowrap grid place-items-center px-5 text-xs font-normal bg-dark hover:bg-dark/80 text-white ring-1 ring-dark/10 duration-200"
        >
          Create an account
        </Link>
      </div>
    </div>
  );
}
