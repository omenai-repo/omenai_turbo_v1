"use client";
import { useState, useRef, useEffect } from "react";
import { icons, UserRoundCheck } from "lucide-react";
import Link from "next/link";
import { dashboard_url } from "@omenai/url-config/src/config";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";

const userMenuItems = [
  { name: "Collection", href: `${dashboard_url()}/user/saves`, icon: "Heart" },
  {
    name: "Acquisitions",
    href: `${dashboard_url()}/user/orders`,
    icon: "Package",
  },
  {
    name: "Settings",
    href: `${dashboard_url()}/user/settings`,
    icon: "Settings",
  },
];

export const UserMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, signOut } = useAuth({ requiredRole: "user" });

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
        className="flex items-center gap-3 group"
      >
        <div className="w-8 h-8 grid place-items-center border border-neutral-200 group-hover:border-black transition-colors">
          <UserRoundCheck size={16} strokeWidth={1.5} />
        </div>
        <span className="hidden lg:block text-[10px] font-bold uppercase tracking-widest">
          {user.name}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-4 w-56 bg-white border border-neutral-200 shadow-xl overflow-hidden">
          <div className="px-4 py-4 bg-neutral-50 border-b border-neutral-100">
            <p className="text-[10px] font-bold uppercase tracking-widest">
              {user.name}
            </p>
            <p className="text-[9px] text-neutral-500 lowercase">
              {user.email}
            </p>
          </div>
          <div className="py-2">
            {userMenuItems.map((item) => {
              const Icon = icons[item.icon as keyof typeof icons];
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center px-4 py-2.5 text-[10px] uppercase tracking-widest text-neutral-600 hover:bg-dark hover:text-white transition-all"
                  onClick={() => setIsOpen(false)}
                >
                  <Icon className="mr-3 h-3 w-3" />
                  {item.name}
                </Link>
              );
            })}
          </div>
          <button
            onClick={() => signOut()}
            className="w-full flex items-center px-4 py-3 text-[10px] uppercase tracking-widest text-red-500 hover:bg-red-50 transition-colors border-t border-neutral-100"
          >
            <icons.LogOut className="mr-3 h-3 w-3" />
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
};
