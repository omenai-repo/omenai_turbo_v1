"use client";
import Link from "next/link";
import { auth_uri } from "@omenai/url-config/src/config";

export default function NavbarActionButtons() {
  const auth_url = auth_uri();

  return (
    <div className="flex items-center gap-1">
      <Link
        href={`${auth_url}/login`}
        className="
          px-4 py-2 rounded-sm
          text-[13px] tracking-wide font-normal
          text-neutral-400 hover:text-neutral-900
          transition-all duration-200 ease-out
          hover:font-medium
        "
      >
        Log in
      </Link>

      <Link
        href={`${auth_url}/register`}
        className="
          px-4 py-2 rounded-sm
          text-[13px] tracking-wide font-medium
          bg-neutral-900 text-white
          hover:bg-neutral-800
          transition-colors duration-200 ease-out
          shadow-sm
        "
      >
        Register
      </Link>
    </div>
  );
}
