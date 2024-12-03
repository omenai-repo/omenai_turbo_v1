"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
export default function DashboardIndicator() {
  const pathname = usePathname().split("/");
  const lastPath = pathname.at(-1);
  return (
    <div className="w-full flex justify-between items-center">
      <div className="text-xs flex-1">
        <p className="font-normal text-dark">Welcome, Admin</p>
        <p className="text-dark">
          <span className="font-light">Admin</span> /{" "}
          <span className="font-normal capitalize text-primary">
            {lastPath}
          </span>
        </p>
      </div>
      <div>
        {lastPath === "editorials" && (
          <Link href={'/admin/dashboard/editorials/upload-editorial'}>
            <button className="h-[45px] px-[20px] bg-[#1a1a1a] text-white text-[12px] rounded-md font-medium">Upload editorial</button>
          </Link>
      )}
      </div>
    </div>
  );
}
