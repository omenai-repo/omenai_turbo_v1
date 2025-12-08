"use client";
import { dashboard_url } from "@omenai/url-config/src/config";
import { Heart, Package, Settings, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

export default function Sidebar() {
  const profileLinks = [
    {
      title: "Personal Info",
      href: `${dashboard_url()}/user-v2/profile`,
      Icon: User,
    },
    {
      title: "Orders",
      href: `${dashboard_url()}/user-v2/orders`,
      Icon: Package,
    },
    {
      title: "Whishlist",
      href: `${dashboard_url()}/user-v2/saves`,
      Icon: Heart,
    },
    {
      title: "Settings",
      href: `${dashboard_url()}/user-v2/settings`,
      Icon: Settings,
    },
  ];

  const pathname = usePathname();

  function isActive(href: string) {
    return href.includes(pathname);
  }
  return (
    <ul className="col-start-1 col-end-3 hidden lg:flex flex-col gap-8 mt-5">
      {profileLinks.map(({ Icon, href, title }) => {
        return (
          <li key={title}>
            <Link
              href={href}
              className={`relative flex gap-4 group items-center hover:text-[#0f172a]  py-3 rounded-sm ${isActive(href) ? "text-[#0f172a] font-semibold is-active" : "text-slate-600"}`}
            >
              <Icon />
              {title}
              <div className="absolute right-0 opacity-0 group-[.is-active]:translate-x-0 group-[.is-active]:opacity-100 transition-all duration-500 bg-[#0f172a] w-[2px] h-full"></div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
