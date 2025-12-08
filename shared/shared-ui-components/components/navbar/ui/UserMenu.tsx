"use client";
import { useState, useRef, useEffect, use } from "react";
import { navigation } from "../desktop/DesktopNavbar";
import { icons, UserRoundCheck } from "lucide-react";
import { IndividualSchemaTypes, SessionDataType } from "@omenai/shared-types";
import Link from "next/link";
import { base_url, dashboard_url } from "@omenai/url-config/src/config";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { toast } from "sonner";
import { toast_notif } from "@omenai/shared-utils/src/toast_notification";
const userMenuItems = [
  { name: "Profile", href: `${dashboard_url()}/user/profile`, icon: "User" },
  {
    name: "Favorites",
    href: `${dashboard_url()}/user/saves`,
    icon: "Heart",
  },
  { name: "Orders", href: `${dashboard_url()}/user/orders`, icon: "Package" },
  {
    name: "Settings",
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

  const handleSignOut = async () => {
    setIsOpen(false);
    toast_notif("Signing you out and redirecting to homepage...", "info");
    await signOut();
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (
        dropdownRef.current &&
        target &&
        !dropdownRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  const IconComponent = icons.ChevronDown;

  return (
    <div className="relative z-50" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 py-2 px-2 md:px-4 rounded-full transition-all duration-300 hover:bg-slate-400/20"
        aria-expanded={isOpen}
      >
        <UserRoundCheck size={20} absoluteStrokeWidth />
        <span className="hidden lg:block text-fluid-xs font-normal text-slate-800">
          {user.name}
        </span>
        <IconComponent
          className={`h-4 w-4 text-slate-800 transition-transform duration-300 ${isOpen ? "rotate-180" : "rotate-0"}`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-[99] mt-3 w-64 origin-top-right divide-y divide-slate-700 rounded-xl bg-dark shadow-2xl ring-1 ring-white/10 backdrop-blur-md">
          <div className="px-4 py-3">
            <p className="text-fluid-xs font-normal text-white">{user.name}</p>
            <p className="truncate text-fluid-xxs text-white/70">
              {user.email.toLowerCase().replace(/\s/g, ".")}
            </p>
          </div>
          <div className="py-1">
            {userMenuItems.map((item) => {
              const ItemIcon = icons[item.icon as keyof typeof icons];
              return (
                <Link
                  onClick={() => setIsOpen(false)}
                  key={item.name}
                  href={item.href}
                  className="flex items-center px-4 py-2 text-fluid-xs text-slate-200 transition-colors duration-200 hover:bg-white hover:text-slate-800 group"
                >
                  <ItemIcon
                    className="mr-3 h-5 w-5 text-slate-300 group-hover:text-slate-800"
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              );
            })}
          </div>
          <div className="py-1">
            <button
              onClick={() => handleSignOut()}
              className="flex w-full items-center px-4 py-2 text-fluid-xs text-slate-200 transition-colors duration-200  hover:text-red-600 group"
            >
              <icons.LogOut
                className="mr-3 h-5 w-5 text-red-500 group-hover:text-red-600"
                aria-hidden="true"
              />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
