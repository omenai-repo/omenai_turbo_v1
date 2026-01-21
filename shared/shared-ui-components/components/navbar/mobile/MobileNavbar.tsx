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
  { label: "Collect Art", href: "/catalog" },
  { label: "Editorials", href: "/articles" },
  { label: "Visit Shop", href: "https://omenai.shop" },
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
      {/* Overlay */}
      <div
        onClick={() => updateOpenSideNav(false)}
        className={`fixed inset-0 z-[99] bg-[#091830]/40 backdrop-blur-sm transition-opacity duration-500 lg:hidden ${
          openSideNav
            ? "opacity-100 visible"
            : "opacity-0 invisible pointer-events-none"
        }`}
      />

      {/* Drawer */}
      <div
        className={`fixed inset-y-0 right-0 z-[100] w-[85%] max-w-sm bg-white shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] lg:hidden ${
          openSideNav ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex justify-between items-center py-5 px-6 border-b border-neutral-100">
            <IndividualLogo />
            <button
              onClick={() => updateOpenSideNav(false)}
              className="p-2 -mr-2 text-neutral-500 hover:text-neutral-900 transition-colors"
            >
              <TfiClose size={20} />
            </button>
          </div>

          {/* Content */}
          <nav className="flex-1 overflow-y-auto px-6 py-6">
            {/* Search Priority */}
            <div className="mb-8">
              <SearchInput setIsMobileMenuOpen={updateOpenSideNav} />
            </div>

            {/* Links */}
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    onClick={() => updateOpenSideNav(false)}
                    className="block px-4 py-3 rounded-lg text-sm font-sans font-medium text-neutral-800 hover:bg-neutral-50 hover:text-dark  transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}

              {user && user.role !== "user" && (
                <li>
                  <Link
                    href={
                      loggedInRouteMap[
                        user.role as keyof typeof loggedInRouteMap
                      ]
                    }
                    onClick={() => updateOpenSideNav(false)}
                    className="block px-4 py-3 rounded-lg text-sm font-sans font-medium text-dark  bg-neutral-50"
                  >
                    Dashboard
                  </Link>
                </li>
              )}
            </ul>

            {/* Footer / Login Actions */}
            {!user && (
              <div className="mt-10 pt-8 border-t border-neutral-100 flex flex-col gap-4">
                <Link
                  href={`${login_base_url}/login/user`}
                  className="w-full text-center py-3 rounded-lg border border-neutral-200 text-sm font-sans font-semibold text-neutral-700 hover:border-neutral-400 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  href={`${login_base_url}/register`}
                  className="w-full text-center py-3 rounded-lg bg-[#091830] text-sm font-sans font-semibold text-white shadow-md hover:bg-[#0F2342] transition-colors"
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
