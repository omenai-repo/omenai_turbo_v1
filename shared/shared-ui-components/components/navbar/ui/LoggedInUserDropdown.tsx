"use client";
import { motion, AnimatePresence } from "framer-motion";
import { Dispatch, SetStateAction, useState } from "react";
import Link from "next/link";
import { UserDashboardNavigationStore } from "@omenai/shared-state-store/src/user/navigation/NavigationStore";
import { toast } from "sonner";
import { dashboard_url, auth_uri } from "@omenai/url-config/src/config";
import {
  HeartPulse,
  Package,
  UserRoundPen,
  Settings,
  LogOut,
  ChevronDown,
  User,
} from "lucide-react";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";

const menuItems = [
  {
    Icon: HeartPulse,
    text: "Saves",
    description: "Your saved works",
  },
  {
    Icon: Package,
    text: "Orders",
    description: "Track your purchases",
  },
  {
    Icon: UserRoundPen,
    text: "Profile",
    description: "Manage your profile",
  },
  {
    Icon: Settings,
    text: "Settings",
    description: "Preferences & account",
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

const itemVariants = {
  open: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.04, duration: 0.16 },
  }),
  closed: { opacity: 0, y: -4 },
};

const LoggedInUserDropDown = ({
  user,
  email,
}: {
  user: string | undefined;
  email: string | undefined;
}) => {
  const [open, setOpen] = useState(false);
  const { setSelected } = UserDashboardNavigationStore();
  const xxs_dashboard_url = dashboard_url();
  const { signOut } = useAuth({ requiredRole: "user" });

  async function handleSignOut() {
    toast.info("Signing out...");
    setOpen(false);
    await signOut();
  }

  return (
    <div className="relative bg-white">
      <motion.div animate={open ? "open" : "closed"} className="relative">
        {/* Trigger Button */}
        <button
          onClick={() => setOpen((prev) => !prev)}
          className={`
            flex items-center gap-2 px-2 py-1.5 rounded-sm
            transition-all duration-200
            ${open ? "bg-neutral-100" : "hover:bg-neutral-50"}
          `}
        >
          {/* Avatar */}
          <div className="w-7 h-7 rounded-sm bg-neutral-900 text-white grid place-items-center shrink-0">
            <User size={13} strokeWidth={1.5} />
          </div>

          <div className="hidden md:flex flex-col items-start leading-none">
            <span className="text-[13px] tracking-wide font-medium text-neutral-800 whitespace-nowrap">
              {user}
            </span>
            <span className="text-[11px] text-neutral-400 whitespace-nowrap mt-0.5 truncate max-w-[120px]">
              {email}
            </span>
          </div>

          <motion.span
            variants={{ open: { rotate: 180 }, closed: { rotate: 0 } }}
            transition={{ duration: 0.2 }}
            className="text-neutral-400"
          >
            <ChevronDown size={14} strokeWidth={1.5} />
          </motion.span>
        </button>

        {/* Dropdown */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial="closed"
              animate="open"
              exit="closed"
              variants={dropdownVariants}
              style={{ originY: "top" }}
              className="
                absolute right-0 top-[calc(100%+8px)] z-50
                w-56 bg-white rounded-sm
                border border-neutral-100
                shadow-xl shadow-neutral-900/[0.06]
                overflow-hidden
              "
            >
              {/* Menu items */}
              <div className="p-1.5">
                {menuItems.map((item, i) => (
                  <motion.div
                    key={item.text}
                    custom={i}
                    initial="closed"
                    animate="open"
                    variants={itemVariants}
                  >
                    <Link
                      href={`${xxs_dashboard_url}/user/${item.text.toLowerCase()}`}
                      onClick={() => {
                        setSelected(item.text.toLowerCase());
                        setOpen(false);
                      }}
                    >
                      <div
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
                          {item.text}
                        </span>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* Divider + Logout */}
              <div className="border-t border-neutral-100 p-1.5">
                <motion.div
                  custom={menuItems.length}
                  initial="closed"
                  animate="open"
                  variants={itemVariants}
                >
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
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default LoggedInUserDropDown;
