"use client";

import { base_url } from "@omenai/url-config/src/config";
import { IndividualLogo } from "../logo/Logo";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaApple, FaGooglePlay } from "react-icons/fa";
import { Instagram, Twitter, Facebook, Linkedin } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();
  const pathname = usePathname();

  // Hide footer on studio/admin paths
  if (pathname?.includes("/studio")) return null;

  return (
    <footer className="w-full bg-white text-dark  border-t border-neutral-200">
      {/* MAIN GRID WRAPPER */}
      <div className="w-full max-w-[1800px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-0">
        {/* COLUMN 1: BRAND IDENTITY (Spans 4 cols) */}
        <div className="lg:col-span-4 flex flex-col justify-between p-8 lg:p-16 lg:border-r border-neutral-100">
          <div className="space-y-6">
            <IndividualLogo />
            <p className="font-sans text-sm text-neutral-500 leading-relaxed max-w-sm">
              The premium marketplace for contemporary African art. We connect
              discerning collectors with the vanguard of global creativity.
            </p>
          </div>

          <div className="mt-12">
            <span className="font-sans text-xs font-bold uppercase tracking-wider text-dark  block mb-4">
              Connect
            </span>
            <div className="flex gap-4">
              {[
                {
                  Icon: Instagram,
                  href: "https://instagram.com/omenaiofficial",
                },
                { Icon: Twitter, href: "https://x.com" },
                { Icon: Facebook, href: "https://facebook.com/omenaiofficial" },
                {
                  Icon: Linkedin,
                  href: "https://linkedin.com/company/omenaiart",
                },
              ].map(({ Icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 text-neutral-500 hover:bg-[#091830] hover:text-white transition-all duration-300"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* COLUMN 2: LINKS CONTAINER (Spans 8 cols) */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-3">
          {/* SUB-COL A: DISCOVER */}
          <div className="p-8 lg:p-16 border-b border-neutral-100 md:border-b-0 md:border-r">
            <h3 className="font-sans text-xs font-bold uppercase tracking-wider mb-8 text-dark ">
              Discover
            </h3>
            <ul className="space-y-4 font-sans text-sm text-neutral-500">
              <li>
                <Link
                  href={`${base_url()}/catalog`}
                  className="hover:text-dark  transition-colors block py-1"
                >
                  The Marketplace
                </Link>
              </li>
              <li>
                <Link
                  href={`${base_url()}/collections`}
                  className="hover:text-dark  transition-colors block py-1"
                >
                  Curated Collections
                </Link>
              </li>
              <li>
                <Link
                  href={`${base_url()}/articles`}
                  className="hover:text-dark  transition-colors block py-1"
                >
                  Editorial Journal
                </Link>
              </li>
              <li>
                <Link
                  href={`${base_url()}/curated`}
                  className="hover:text-dark  transition-colors block py-1"
                >
                  Private View
                </Link>
              </li>
            </ul>
          </div>

          {/* SUB-COL B: SUPPORT */}
          <div className="p-8 lg:p-16 border-b border-neutral-100 md:border-b-0 md:border-r">
            <h3 className="font-sans text-xs font-bold uppercase tracking-wider mb-8 text-dark ">
              Support
            </h3>
            <ul className="space-y-4 font-sans text-sm text-neutral-500">
              <li>
                <Link
                  href="#"
                  className="hover:text-dark  transition-colors block py-1"
                >
                  Help Center & FAQ
                </Link>
              </li>
              <li>
                <Link
                  href="mailto:info@omenai.app"
                  className="hover:text-dark  transition-colors block py-1"
                >
                  Contact Concierge
                </Link>
              </li>
              <li>
                <Link
                  href={`${base_url()}/privacy`}
                  className="hover:text-dark  transition-colors block py-1"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href={`${base_url()}/legal?ent=collector`}
                  className="hover:text-dark  transition-colors block py-1"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* SUB-COL C: MOBILE APP */}
          <div className="p-8 lg:p-16 bg-[#fafafa]">
            <h3 className="font-sans text-xs font-bold uppercase tracking-wider mb-8 text-dark ">
              Get the App
            </h3>
            <div className="flex flex-col gap-4">
              <p className="font-sans text-xs text-neutral-500 leading-relaxed mb-2">
                Manage your collection and bid in real-time from anywhere.
              </p>

              <a
                href="https://apps.apple.com/app/omenai"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 w-full rounded-md bg-white border border-neutral-200 px-4 py-3 hover:border-[#091830] hover:shadow-md transition-all duration-300"
              >
                <FaApple className="text-xl text-dark " />
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold uppercase text-neutral-400 leading-none">
                    Download on the
                  </span>
                  <span className="text-xs font-bold text-dark  leading-tight">
                    App Store
                  </span>
                </div>
              </a>

              <a
                href="https://play.google.com/store/apps/details?id=com.omenai.omenaiapp"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 w-full rounded-md bg-white border border-neutral-200 px-4 py-3 hover:border-[#091830] hover:shadow-md transition-all duration-300"
              >
                <FaGooglePlay className="text-lg text-dark " />
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold uppercase text-neutral-400 leading-none">
                    Get it on
                  </span>
                  <span className="text-xs font-bold text-dark  leading-tight">
                    Google Play
                  </span>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
