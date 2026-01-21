"use client";
import { useState, useRef, useEffect } from "react";
import { icons, User } from "lucide-react";
import Link from "next/link";
import { base_url, dashboard_url } from "@omenai/url-config/src/config";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { toast_notif } from "@omenai/shared-utils/src/toast_notification";

const userMenuItems = [
  {
    name: "My Collection",
    href: `${dashboard_url()}/user/saves`,
    icon: "Heart",
  },
  {
    name: "Orders & Bids",
    href: `${dashboard_url()}/user/orders`,
    icon: "Package",
  },
  {
    name: "Account Settings",
    href: `${dashboard_url()}/user/settings`,
    icon: "Settings",
  },
];

export const UserMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, signOut } = useAuth({
    requiredRole: "user",
    redirectUrl: `${base_url()}`,
  });

  async function handleSignOut() {
    toast_notif("Signing out...", "info");
    await signOut();
  }

  useEffect(() => {
    const close = (e: MouseEvent) =>
      !dropdownRef.current?.contains(e.target as Node) && setIsOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-3 px-2 py-1.5 rounded-full transition-all duration-200 ${
          isOpen ? "bg-neutral-100" : "hover:bg-neutral-50"
        }`}
      >
        <div className="w-8 h-8 rounded-full bg-[#091830] text-white grid place-items-center shadow-sm">
          <User size={16} strokeWidth={2} />
        </div>
        <div className="hidden lg:flex flex-col items-start">
          <span className="text-xs font-sans font-semibold text-dark  leading-none">
            {user.name.split(" ")[0]}
          </span>
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white border border-neutral-100 rounded-lg shadow-xl ring-1 ring-black/5 overflow-hidden z-50">
          <div className="px-5 py-4 bg-neutral-50 border-b border-neutral-100">
            <p className="text-sm font-sans font-semibold text-dark ">
              {user.name}
            </p>
            <p className="text-xs text-neutral-500 font-sans truncate">
              {user.email}
            </p>
          </div>

          <div className="p-2">
            {userMenuItems.map((item) => {
              const Icon = icons[item.icon as keyof typeof icons];
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center px-4 py-2.5 text-sm font-sans font-medium text-neutral-600 rounded-md hover:bg-neutral-50 hover:text-dark  transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <Icon className="mr-3 h-4 w-4 text-neutral-400 group-hover:text-dark " />
                  {item.name}
                </Link>
              );
            })}
          </div>

          <div className="p-2 border-t border-neutral-100">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center px-4 py-2.5 text-sm font-sans font-medium text-red-600 rounded-md hover:bg-red-50 transition-colors"
            >
              <icons.LogOut className="mr-3 h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
