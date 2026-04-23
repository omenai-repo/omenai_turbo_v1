"use client";
import React from "react";
import { UserMenu } from "../ui/UserMenu";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import Link from "next/link";
import { IndividualLogo } from "../../logo/Logo";
import NavbarLink from "../ui/NavbarLink";
import SearchInput from "../ui/SearchInput";
import {
  admin_url,
  auth_uri,
  dashboard_url,
} from "@omenai/url-config/src/config";
import { actionStore } from "@omenai/shared-state-store/src/actions/ActionStore";
import MobileNavbar from "../mobile/MobileNavbar";
import { useRedirectBehavior } from "@omenai/shared-hooks/hooks/useRedirectBehaviour";
import { Menu } from "lucide-react";

export const navigation = [
  { name: "Collect", href: "/catalog" },
  { name: "Editorials", href: "/articles" },
  { name: "Shows", href: "/shows" },
  { name: "Fairs & Events", href: "/events" },
  { name: "Galleries", href: "/partners" },
];

const loggedInRouteMap = {
  artist: `${dashboard_url()}/artist/app/overview`,
  gallery: `${dashboard_url()}/gallery/overview`,
  admin: `${admin_url()}/admin/requests/gallery`,
};

const DesktopNavbar = () => {
  const { updateOpenSideNav } = actionStore();
  const { getCurrentUrl } = useRedirectBehavior();
  const { user } = useAuth({ requiredRole: "user" });
  const login_base_url = auth_uri();

  return (
    <>
      <nav
        className="
          fixed z-[30] top-0 left-0 right-0
          px-4 py-2 md:px-8
          bg-white/75 backdrop-blur-xl
          border-b border-neutral-200/60
          supports-[backdrop-filter]:bg-white/90
        "
      >
        <div className="max-w-full mx-auto flex items-center justify-between">
          {/* LEFT: Logo + Nav links */}
          <div className="flex items-center gap-10">
            <IndividualLogo />

            <ul className="hidden lg:flex items-center gap-8">
              {navigation.map((item) => (
                <NavbarLink
                  key={item.name}
                  text={item.name}
                  link={item.href}
                  disabled={false}
                />
              ))}
              {user && user.role !== "user" && (
                <NavbarLink
                  text="Dashboard"
                  link={
                    loggedInRouteMap[user.role as keyof typeof loggedInRouteMap]
                  }
                  disabled={false}
                />
              )}
            </ul>
          </div>

          {/* RIGHT: Search + Auth */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* Search — hidden on mobile */}
            <div className="hidden md:block w-60">
              <SearchInput setIsMobileMenuOpen={updateOpenSideNav} />
            </div>

            {/* Divider */}
            <div className="hidden lg:block w-px h-5 bg-neutral-200 mx-1" />

            {/* Auth area */}
            {user && user.role === "user" ? (
              <UserMenu />
            ) : (
              <div className="hidden lg:flex items-center gap-1">
                <Link
                  href={`${login_base_url}/login/user?redirect=${encodeURIComponent(getCurrentUrl())}`}
                  className="
                    px-4 py-2 rounded-sm
                    text-[13px] tracking-wide font-normal
                    text-neutral-400 hover:text-neutral-900 hover:font-medium
                    transition-all duration-200
                  "
                >
                  Log in
                </Link>
                <Link
                  href={`${login_base_url}/register?redirect=${encodeURIComponent(getCurrentUrl())}`}
                  className="
                    px-4 py-2 rounded-sm
                    text-[13px] tracking-wide font-medium
                    bg-neutral-900 text-white
                    hover:bg-neutral-800
                    transition-colors duration-200
                    shadow-sm
                  "
                >
                  Register
                </Link>
              </div>
            )}

            {/* Hamburger — mobile/tablet only */}
            <button
              onClick={() => updateOpenSideNav(true)}
              className="
                lg:hidden p-2 rounded-sm
                text-neutral-500 hover:text-neutral-900
                hover:bg-neutral-100
                transition-all duration-200
              "
              aria-label="Open menu"
            >
              <Menu size={20} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </nav>

      <MobileNavbar />

      {/* Spacer */}
      <div className="h-[65px]" />
    </>
  );
};

export default DesktopNavbar;
