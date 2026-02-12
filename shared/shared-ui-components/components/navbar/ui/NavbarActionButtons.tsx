"use client";
import Link from "next/link";
import { auth_uri } from "@omenai/url-config/src/config";

export default function NavbarActionButtons() {
  const auth_url = auth_uri();
  return (
    <div className="flex items-center gap-4">
      <Link
        href={`${auth_url}/login`}
        className="text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-500 hover:text-dark transition-colors px-4 py-2"
      >
        Login
      </Link>
      <Link
        href={`${auth_url}/register`}
        className="bg-dark text-white px-8 py-3 text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-neutral-800 transition-all border border-black"
      >
        Register
      </Link>
    </div>
  );
}
