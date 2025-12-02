"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { UserMenu } from "../ui/UserMenu";
import { icons } from "../ui/icons";
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
import { usePathname } from "next/navigation";

export const navigation = [
  { name: "Collect", href: "/catalog" },
  { name: "Editorials", href: "/articles" },
];

const loggedInRouteMap = {
  artist: `${dashboard_url()}/artist/app/overview`,
  gallery: `${dashboard_url()}/gallery/overview`,
  admin: `${admin_url()}/admin/requests/gallery`,
};

// Component for the User Dropdown

// Main Navbar Component
const DesktopNavbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { user } = useAuth({ requiredRole: "user" });

  const isLoggedIn = !!user;
  const isCollectorLoggedIn = !!user && user.role === "user";

  // Logic for scroll state (Full-width vs. Floating)
  const handleScroll = useCallback(() => {
    // Check if scroll position is beyond a certain threshold (e.g., 50px)
    const offset = window.scrollY;
    if (offset > 1) {
      setIsScrolled(true);
    } else {
      setIsScrolled(false);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);
  const pathname = usePathname();
  const fullUrl = `${window.location.origin}${pathname}`;
  const navClasses = `
    fixed z-30 top-0 left-0 right-0 transition-all duration-500 ease-in-out transform py-4 md:px-12
    ${
      isScrolled
        ? "md:top-6 md:w-[96%] md:max-w-6xl md:mx-auto bg-white/90 shadow-2xl ring-1 ring-dark/10 rounded-full backdrop-blur-lg" // LIGHT THEME FLOATING
        : "md:w-[96%] md:max-w-6xl md:mx-auto bg-white rounded-none"
    }
  `;
  const login_base_url = auth_uri();
  return (
    <>
      <nav className={navClasses}>
        <div
          className={`flex items-center justify-between transition-all duration-300 px-4`}
        >
          <IndividualLogo />

          {/* Desktop Navigation Links (Hidden on Mobile) */}
          <div className="hidden lg:flex lg:space-x-8 items-center">
            {navigation.map((item) => (
              <NavbarLink
                key={item.name}
                text={item.name}
                link={item.href}
                disabled={false}
              />
            ))}
            {isLoggedIn && user.role !== "user" && (
              <NavbarLink
                text={`Go to ${user.role} dashboard`}
                link={
                  isLoggedIn
                    ? loggedInRouteMap[
                        user.role as keyof typeof loggedInRouteMap
                      ]
                    : `${auth_uri()}/login`
                }
                disabled={false}
              />
            )}

            {/* Search Bar */}
            <SearchInput setIsMobileMenuOpen={setIsMobileMenuOpen} />
          </div>

          {/* Auth & Menu Controls */}
          <div className="flex items-center space-x-3">
            {isCollectorLoggedIn ? (
              <UserMenu />
            ) : (
              <div className="hidden lg:flex space-x-3">
                <Link
                  href={`${login_base_url}/login/user?redirect=${encodeURIComponent(fullUrl)}`}
                  className="px-4 py-2 text-fluid-xs  font-normal text-slate-800 hover:text-slate-800/80 transition-colors duration-200 rounded-full shadow-sm shadow-slate-500/20 hover:shadow-slate-500/30"
                >
                  Login
                </Link>
                <Link
                  href={`${login_base_url}/register?redirect=${encodeURIComponent(fullUrl)}`}
                  className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 text-fluid-xxs font-normal rounded-full shadow-lg shadow-slate-500/30 transition-all duration-300 transform hover:scale-[1.02]"
                >
                  Sign up
                </Link>
              </div>
            )}

            {/* Mobile Menu Button (Hamburger) */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-800 hover:bg-slate-800 transition-colors duration-200"
              aria-controls="mobile-menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <icons.X className="h-6 w-6" aria-label="Close menu" />
              ) : (
                <icons.Menu className="h-6 w-6" aria-label="Open menu" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu Content (Transitioning Drawer) */}
        <div
          id="mobile-menu"
          className={`lg:hidden overflow-hidden transition-all duration-500 ease-in-out ${isMobileMenuOpen ? "max-h-96 opacity-100 mt-4 border-t border-slate-700 pt-4" : "max-h-0 opacity-0"}`}
        >
          <div className="space-y-2 px-2 pb-3">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="block w-full text-fluid-xs font-normal text-slate-800 hover:bg-slate-700/50 px-3 py-2 rounded-lg"
              >
                {item.name}
              </a>
            ))}

            <div className="relative pt-2">
              <SearchInput setIsMobileMenuOpen={setIsMobileMenuOpen} />
            </div>

            {!isCollectorLoggedIn && (
              <div className="pt-4 flex flex-row space-x-2">
                <Link
                  href={`${login_base_url}/login`}
                  className="w-full text-center px-3 py-2 text-fluid-xs font-normal text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-2xl border border-slate-300 shadow-sm transition"
                >
                  Login
                </Link>
                <Link
                  href={`${login_base_url}/register`}
                  className="w-full text-center bg-slate-800 hover:bg-slate-700 text-white px-3 py-2 text-fluid-xs font-normal rounded-2xl shadow-lg"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>
      <div
        className={`transition-all duration-500 ease-in-out ${isScrolled ? "h-0 opacity-0" : "h-20 opacity-100"}`}
        aria-hidden={isScrolled}
      ></div>
    </>
  );
};

export default DesktopNavbar;
