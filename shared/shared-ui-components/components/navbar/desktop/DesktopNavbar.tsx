"use client";
import React, { useState, useEffect, useCallback } from "react";
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

const DesktopNavbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [fullUrl, setFullUrl] = useState<string>("");

  const { user } = useAuth({ requiredRole: "user" });
  const pathname = usePathname();

  const handleScroll = useCallback(() => {
    setIsScrolled(window.scrollY > 20);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    setFullUrl(`${window.location.origin}${pathname}`);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll, pathname]);

  const login_base_url = auth_uri();

  return (
    <>
      <nav
        className={`fixed z-[20] top-0 left-0 right-0 transition-all duration-700 ease-in-out border-b
          ${
            isScrolled
              ? "py-3 bg-white/90 backdrop-blur-md border-neutral-200 shadow-sm"
              : "py-6 bg-white border-transparent"
          }`}
      >
        <div className="max-w-[1800px] mx-auto px-6 md:px-12 flex items-center justify-between">
          <div className="flex items-center gap-12">
            <IndividualLogo />

            {/* Desktop Navigation */}
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

          <div className="flex items-center gap-6">
            <div className="hidden md:block">
              <SearchInput setIsMobileMenuOpen={setIsMobileMenuOpen} />
            </div>

            {user && user.role === "user" ? (
              <UserMenu />
            ) : (
              <div className="hidden lg:flex items-center gap-4">
                <Link
                  href={`${login_base_url}/login/user?redirect=${encodeURIComponent(fullUrl)}`}
                  className="text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-500 hover:text-dark transition-colors"
                >
                  Login
                </Link>
                <Link
                  href={`${login_base_url}/register?redirect=${encodeURIComponent(fullUrl)}`}
                  className="bg-dark text-white px-6 py-2.5 text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-neutral-800 transition-all"
                >
                  Join Omenai
                </Link>
              </div>
            )}

            {/* Hamburger - Architectural style */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-dark"
            >
              {isMobileMenuOpen ? (
                <icons.X strokeWidth={1.5} />
              ) : (
                <icons.Menu strokeWidth={1.5} />
              )}
            </button>
          </div>
        </div>
      </nav>
      {/* Spacer */}
      <div
        className={`transition-all duration-500 ${isScrolled ? "h-16" : "h-24"}`}
      />
    </>
  );
};

export default DesktopNavbar;
