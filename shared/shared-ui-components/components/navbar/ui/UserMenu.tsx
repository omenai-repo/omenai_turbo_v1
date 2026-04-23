"use client";
import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { base_url, dashboard_url } from "@omenai/url-config/src/config";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { toast_notif } from "@omenai/shared-utils/src/toast_notification";
import {
  Heart,
  Package,
  Settings,
  LogOut,
  User,
  ChevronDown,
} from "lucide-react";

const userMenuItems = [
  {
    name: "My Collection",
    href: `${dashboard_url()}/user/saves`,
    Icon: Heart,
  },
  {
    name: "Orders & Bids",
    href: `${dashboard_url()}/user/orders`,
    Icon: Package,
  },
  {
    name: "Account Settings",
    href: `${dashboard_url()}/user/settings`,
    Icon: Settings,
  },
];

const dropdownVariants = {
  open: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.18, ease: [0.16, 1, 0.3, 1] },
  },
  closed: {
    opacity: 0,
    y: -6,
    scale: 0.97,
    transition: { duration: 0.14, ease: "easeIn" },
  },
};

export const UserMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, signOut } = useAuth({
    requiredRole: "user",
    redirectUrl: `${base_url()}`,
  });

  async function handleSignOut() {
    toast_notif("Signing out...", "info");
    setIsOpen(false);
    await signOut();
  }

  useEffect(() => {
    const close = (e: MouseEvent) =>
      !dropdownRef.current?.contains(e.target as Node) && setIsOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const firstName = user?.name?.split(" ")[0] ?? "";
  const initials = user?.name
    ?.split(" ")
    .slice(0, 2)
    .map((n: string) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-2 px-2 py-1.5 rounded-sm
          transition-all duration-200
          ${isOpen ? "bg-neutral-100" : "hover:bg-neutral-50"}
        `}
      >
        {/* Avatar with initials */}
        <div className="w-7 h-7 rounded-sm bg-neutral-900 text-white grid place-items-center shrink-0">
          {initials ? (
            <span className="text-[11px] font-medium tracking-wider">
              {initials}
            </span>
          ) : (
            <User size={13} strokeWidth={1.5} />
          )}
        </div>

        <span className="hidden lg:block text-[13px] tracking-wide font-medium text-neutral-700 whitespace-nowrap">
          {firstName}
        </span>

        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-neutral-400"
        >
          <ChevronDown size={14} strokeWidth={1.5} />
        </motion.span>
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={dropdownVariants}
            style={{ originY: "top" }}
            className="
              absolute right-0 top-[calc(100%+8px)] z-50
              w-60 bg-white rounded-sm
              border border-neutral-100
              shadow-xl shadow-neutral-900/[0.06]
              overflow-hidden
            "
          >
            {/* Header */}
            <div className="px-4 py-3.5 border-b border-neutral-50 bg-neutral-50/60">
              <p className="text-[13px] font-medium tracking-wide text-neutral-800">
                {user?.name}
              </p>
              <p className="text-[11px] text-neutral-400 mt-0.5 truncate">
                {user?.email}
              </p>
            </div>

            {/* Items */}
            <div className="p-1.5">
              {userMenuItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="
                    flex items-center gap-3 px-3 py-2.5 rounded-sm
                    group transition-all duration-150
                    hover:bg-neutral-50 cursor-pointer
                  "
                >
                  <item.Icon
                    size={15}
                    strokeWidth={1.5}
                    className="text-neutral-400 group-hover:text-neutral-700 transition-colors shrink-0"
                  />
                  <span className="text-[13px] tracking-wide text-neutral-600 group-hover:text-neutral-900 group-hover:font-medium transition-all duration-150">
                    {item.name}
                  </span>
                </Link>
              ))}
            </div>

            {/* Sign out */}
            <div className="border-t border-neutral-100 p-1.5">
              <button
                onClick={handleSignOut}
                className="
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-sm
                  group transition-all duration-150
                  hover:bg-red-50 cursor-pointer
                "
              >
                <LogOut
                  size={15}
                  strokeWidth={1.5}
                  className="text-neutral-400 group-hover:text-red-500 transition-colors shrink-0"
                />
                <span className="text-[13px] tracking-wide text-neutral-600 group-hover:text-red-600 transition-colors">
                  Sign out
                </span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
