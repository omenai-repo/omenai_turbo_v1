"use client";
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { actionStore } from "@omenai/shared-state-store/src/actions/ActionStore";
import { X } from "lucide-react";
import { IndividualLogo } from "../../logo/Logo";
import Link from "next/link";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import {
  admin_url,
  auth_uri,
  dashboard_url,
} from "@omenai/url-config/src/config";
import SearchInput from "../ui/SearchInput";
import { ArrowUpRight } from "lucide-react";

const navItems = [
  { label: "Collect", href: "/catalog" },
  { label: "Editorials", href: "/articles" },
  // { label: "Shows", href: "/shows" },
  // { label: "Fairs & Events", href: "/events" },
  // { label: "Galleries", href: "/partners" },
];

const loggedInRouteMap = {
  artist: `${dashboard_url()}/artist/app/overview`,
  gallery: `${dashboard_url()}/gallery/overview`,
  admin: `${admin_url()}/admin/requests/gallery`,
};

const overlayVariants = {
  open: { opacity: 1, transition: { duration: 0.25 } },
  closed: { opacity: 0, transition: { duration: 0.2 } },
};

const drawerVariants = {
  open: {
    x: 0,
    transition: { duration: 0.35, ease: [0.32, 0.72, 0, 1] },
  },
  closed: {
    x: "100%",
    transition: { duration: 0.3, ease: [0.32, 0.72, 0, 1] },
  },
};

const itemVariants = {
  open: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: 0.08 + i * 0.05, duration: 0.22, ease: "easeOut" },
  }),
  closed: { opacity: 0, x: 12 },
};

export default function MobileNavbar() {
  const { openSideNav, updateOpenSideNav } = actionStore();
  const { user } = useAuth({ requiredRole: "user" });
  const login_base_url = auth_uri();

  // Scroll lock
  useEffect(() => {
    if (openSideNav) {
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
      document.body.style.overflowY = "hidden";
    } else {
      const scrollY = document.body.style.top;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.overflowY = "";
      window.scrollTo(0, parseInt(scrollY || "0") * -1);
    }
  }, [openSideNav]);

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {openSideNav && (
          <motion.div
            key="overlay"
            initial="closed"
            animate="open"
            exit="closed"
            variants={overlayVariants}
            onClick={() => updateOpenSideNav(false)}
            className="fixed inset-0 z-[99] bg-neutral-900/20 backdrop-blur-[2px] lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Drawer */}
      <AnimatePresence>
        {openSideNav && (
          <motion.div
            key="drawer"
            initial="closed"
            animate="open"
            exit="closed"
            variants={drawerVariants}
            className="
              fixed inset-y-0 right-0 z-[100]
              w-[82%] max-w-[340px]
              bg-white
              border-l border-neutral-100
              shadow-2xl shadow-neutral-900/10
              lg:hidden
              flex flex-col
            "
          >
            {/* Header */}
            <div className="flex justify-between items-center py-5 px-6 border-b border-neutral-100">
              <IndividualLogo />
              <button
                onClick={() => updateOpenSideNav(false)}
                className="
                  p-1.5 -mr-1.5 rounded-sm
                  text-neutral-400 hover:text-neutral-900
                  hover:bg-neutral-100
                  transition-all duration-200
                "
              >
                <X size={18} strokeWidth={1.5} />
              </button>
            </div>

            {/* Scrollable body */}
            <nav className="flex-1 overflow-y-auto p-4">
              {/* Search */}
              <motion.div
                custom={0}
                initial="closed"
                animate="open"
                variants={itemVariants}
                className="mb-8"
              >
                <SearchInput setIsMobileMenuOpen={updateOpenSideNav} />
              </motion.div>

              {/* Section label */}
              <p className="text-[10px] uppercase tracking-[0.18em] text-neutral-400 font-medium mb-3 px-1">
                Explore
              </p>

              {/* Nav links */}
              <ul className="space-y-0.5">
                {navItems.map((item, i) => (
                  <motion.li
                    key={item.label}
                    custom={i + 1}
                    initial="closed"
                    animate="open"
                    variants={itemVariants}
                  >
                    <Link
                      href={item.href}
                      onClick={() => updateOpenSideNav(false)}
                      className="
                        group flex items-center justify-between
                        px-3 py-3 rounded-sm
                        transition-all duration-150
                        hover:bg-neutral-50
                      "
                    >
                      <span className="text-[14px] tracking-wide font-normal text-neutral-600 group-hover:text-neutral-900 group-hover:font-medium transition-all duration-150">
                        {item.label}
                      </span>
                      <ArrowUpRight
                        size={13}
                        className="text-neutral-300 group-hover:text-neutral-500 transition-colors"
                        strokeWidth={1.5}
                      />
                    </Link>
                  </motion.li>
                ))}

                {/* Dashboard link for non-user roles */}
                {user && user.role !== "user" && (
                  <motion.li
                    custom={navItems.length + 1}
                    initial="closed"
                    animate="open"
                    variants={itemVariants}
                  >
                    <Link
                      href={
                        loggedInRouteMap[
                          user.role as keyof typeof loggedInRouteMap
                        ]
                      }
                      onClick={() => updateOpenSideNav(false)}
                      className="
                        group flex items-center justify-between
                        px-3 py-3 rounded-sm mt-1
                        bg-neutral-900 hover:bg-neutral-800
                        transition-colors duration-150
                      "
                    >
                      <span className="text-[14px] tracking-wide font-medium text-white">
                        Dashboard
                      </span>
                      <ArrowUpRight
                        size={13}
                        className="text-white/60"
                        strokeWidth={1.5}
                      />
                    </Link>
                  </motion.li>
                )}
              </ul>
            </nav>

            {/* Footer auth actions */}
            {!user && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  transition: { delay: 0.3, duration: 0.22 },
                }}
                className="p-4 border-t border-neutral-100 flex flex-col gap-2.5"
              >
                <Link
                  href={`${login_base_url}/login/user`}
                  className="
                    w-full text-center py-3 rounded-sm
                    text-[13px] tracking-wide font-medium
                    text-neutral-700
                    border border-neutral-200
                    hover:border-neutral-400 hover:text-neutral-900
                    transition-all duration-200
                  "
                >
                  Log in
                </Link>
                <Link
                  href={`${login_base_url}/register`}
                  className="
                    w-full text-center py-3 rounded-sm
                    text-[13px] tracking-wide font-medium
                    bg-neutral-900 text-white
                    hover:bg-neutral-800
                    transition-colors duration-200
                    shadow-sm
                  "
                >
                  Create Account
                </Link>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
