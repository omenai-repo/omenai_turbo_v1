"use client";
import { useEffect } from "react";
import { actionStore } from "@omenai/shared-state-store/src/actions/ActionStore";
import { TfiClose } from "react-icons/tfi";
import { IndividualLogo } from "../../logo/Logo";
import Link from "next/link";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import {
  admin_url,
  auth_uri,
  dashboard_url,
} from "@omenai/url-config/src/config";
import SearchInput from "../ui/SearchInput";

const navItems = [
  { label: "Collect", href: "/catalog", index: "01" },
  { label: "Editorials", href: "/articles", index: "02" },
  { label: "Shop", href: "https://omenai.shop", index: "03" },
];

const loggedInRouteMap = {
  artist: `${dashboard_url()}/artist/app/overview`,
  gallery: `${dashboard_url()}/gallery/overview`,
  admin: `${admin_url()}/admin/requests/gallery`,
};

export default function MobileNavbar() {
  const { openSideNav, updateOpenSideNav } = actionStore();
  const { user } = useAuth({ requiredRole: "user" });
  const login_base_url = auth_uri();

  // Scroll Lock
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
      <div
        onClick={() => updateOpenSideNav(false)}
        className={`fixed inset-0 z-[99] bg-black/20 backdrop-blur-sm transition-opacity duration-500 lg:hidden ${
          openSideNav
            ? "opacity-100 visible"
            : "opacity-0 invisible pointer-events-none"
        }`}
      />

      <div
        className={`fixed inset-y-0 right-0 z-[100] w-full max-w-sm bg-white shadow-2xl transition-transform duration-700 ease-[cubic-bezier(0.76,0,0.24,1)] lg:hidden ${
          openSideNav ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex justify-between items-center py-6 px-6 border-b border-neutral-100">
            <IndividualLogo />
            <button
              onClick={() => updateOpenSideNav(false)}
              className="p-2 hover:bg-neutral-50 rounded-full transition-colors"
            >
              <TfiClose size={24} />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-8 py-8">
            {/* Search Input (Mobile Only) */}
            <div className="mb-10">
              <SearchInput setIsMobileMenuOpen={updateOpenSideNav} />
            </div>

            <ul className="space-y-8">
              {navItems.map((item) => (
                <li key={item.index} className="group overflow-hidden">
                  <Link
                    href={item.href}
                    onClick={() => updateOpenSideNav(false)}
                    className="flex items-end gap-4"
                  >
                    <span className="text-[10px] font-mono text-neutral-300 mb-2">
                      {item.index}
                    </span>
                    <span className="text-4xl font-serif italic text-dark group-hover:pl-4 transition-all duration-500">
                      {item.label}
                    </span>
                  </Link>
                </li>
              ))}

              {user && user.role !== "user" && (
                <li className="group overflow-hidden">
                  <Link
                    href={
                      loggedInRouteMap[
                        user.role as keyof typeof loggedInRouteMap
                      ]
                    }
                    onClick={() => updateOpenSideNav(false)}
                    className="flex items-end gap-4"
                  >
                    <span className="text-[10px] font-mono text-neutral-300 mb-2">
                      04
                    </span>
                    <span className="text-4xl font-serif italic text-dark group-hover:pl-4 transition-all duration-500">
                      Dashboard
                    </span>
                  </Link>
                </li>
              )}
            </ul>

            {/* If NOT logged in, we still need Login links here because 
                the header UserMenu won't exist for guests */}
            {!user && (
              <div className="mt-20 pt-8 border-t border-neutral-100 flex flex-col gap-6">
                <Link
                  href={`${login_base_url}/login/user`}
                  className="text-xs uppercase tracking-[0.3em] font-bold hover:text-neutral-600 transition-colors"
                >
                  Login
                </Link>
                <Link
                  href={`${login_base_url}/register`}
                  className="text-xs uppercase tracking-[0.3em] font-bold text-neutral-400 hover:text-black transition-colors"
                >
                  Create Account
                </Link>
              </div>
            )}
          </nav>
        </div>
      </div>
    </>
  );
}
