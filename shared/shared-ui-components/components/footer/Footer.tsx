"use client";

import { base_url } from "@omenai/url-config/src/config";
import { Instagram, Twitter, Facebook, Linkedin } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
  const year = new Date().getFullYear();
  const pathname = usePathname();

  // Hide footer on studio/admin paths
  if (pathname?.includes("/studio")) return null;

  return (
    <footer className="w-full bg-white text-dark border-t border-black">
      {/* MAIN GRID WRAPPER */}
      <div className="w-full max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-12">
        {/* COLUMN 1: BRAND IDENTITY (Spans 4 cols on Desktop, Full on Mobile) */}
        <div className="lg:col-span-4 flex flex-col justify-between p-8 lg:p-12 border-b border-neutral-200 lg:border-b-0 lg:border-r">
          <div className="space-y-6">
            <h2 className="font-serif text-3xl italic">Omenai.</h2>
            <p className="font-sans text-sm text-neutral-500 leading-relaxed max-w-sm">
              The digital atelier for the contemporary collector. Discover,
              acquire, and archive fine art from the global vanguard.
            </p>
          </div>

          <div className="mt-12">
            <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 block mb-4">
              Social Index
            </span>
            <div className="flex gap-6">
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
                  className="text-neutral-400 hover:text-dark transition-colors duration-300"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* COLUMN 2: LINKS CONTAINER (Spans 8 cols on Desktop) */}
        {/* Nested Grid: 1 col on Mobile, 3 cols on Tablet/Desktop */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-3">
          {/* SUB-COL A: DIRECTORY */}
          <div className="p-8 lg:p-12 border-b border-neutral-200 md:border-b-0 md:border-r">
            <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] mb-6 lg:mb-8 text-neutral-900">
              Directory
            </h3>
            <ul className="space-y-4 font-sans text-sm text-neutral-600">
              <li>
                <Link
                  href={`${base_url()}/catalog`}
                  className="hover:text-dark hover:underline underline-offset-4 decoration-1 transition-all"
                >
                  The Collection
                </Link>
              </li>
              <li>
                <Link
                  href={`${base_url()}/collections`}
                  className="hover:text-dark hover:underline underline-offset-4 decoration-1 transition-all"
                >
                  The Anthologies
                </Link>
              </li>
              <li>
                <Link
                  href={`${base_url()}/articles`}
                  className="hover:text-dark hover:underline underline-offset-4 decoration-1 transition-all"
                >
                  Editorial
                </Link>
              </li>
              <li>
                <Link
                  href={`${base_url()}/curated`}
                  className="hover:text-dark hover:underline underline-offset-4 decoration-1 transition-all"
                >
                  Private View
                </Link>
              </li>
            </ul>
          </div>

          {/* SUB-COL B: CLIENT SERVICES */}
          <div className="p-8 lg:p-12 border-b border-neutral-200 md:border-b-0 md:border-r">
            <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] mb-6 lg:mb-8 text-neutral-900">
              Client Services
            </h3>
            <ul className="space-y-4 font-sans text-sm text-neutral-600">
              <li>
                <Link
                  href="#"
                  className="hover:text-dark hover:underline underline-offset-4 decoration-1 transition-all"
                >
                  FAQ & Assistance
                </Link>
              </li>
              <li>
                <Link
                  href="mailto:info@omenai.app"
                  className="hover:text-dark hover:underline underline-offset-4 decoration-1 transition-all"
                >
                  Contact Concierge
                </Link>
              </li>
              <li className="pt-4 opacity-50">
                <Link
                  href={`${base_url()}/privacy`}
                  className="text-xs hover:text-dark"
                >
                  Privacy Policy
                </Link>
              </li>
              <li className="opacity-50">
                <Link
                  href={`${base_url()}/legal?ent=collector`}
                  className="text-xs hover:text-dark"
                >
                  Terms of Use
                </Link>
              </li>
            </ul>
          </div>

          {/* SUB-COL C: ACCESS POINTS */}
          <div className="p-8 lg:p-12 bg-neutral-50">
            <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] mb-6 lg:mb-8 text-neutral-900">
              Access Points
            </h3>
            <div className="flex flex-col gap-4">
              <p className="font-sans text-xs text-neutral-500 mb-2">
                Manage your collection on the go.
              </p>

              <a
                href="https://apps.apple.com/app/omenai"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between w-full border border-neutral-300 bg-white px-4 py-3 hover:border-black transition-colors duration-300"
              >
                <span className="font-sans text-xs font-medium">App Store</span>
                <svg
                  className="w-4 h-4 text-neutral-400 group-hover:text-dark transition-colors"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
              </a>

              <a
                href="https://play.google.com/store/apps/details?id=com.omenai.omenaiapp"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between w-full border border-neutral-300 bg-white px-4 py-3 hover:border-black transition-colors duration-300"
              >
                <span className="font-sans text-xs font-medium">
                  Google Play
                </span>
                <svg
                  className="w-4 h-4 text-neutral-400 group-hover:text-dark transition-colors"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER BASE: The "Stamp" */}
      <div className="border-t border-neutral-200">
        <div className="w-full max-w-[1440px] mx-auto px-6 lg:px-12 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
            © {year} Omenai Inc. Lagos / Global.
          </span>
          <span className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
            Art is Essential.
          </span>
        </div>

        {/* BIG TYPOGRAPHY FINISH */}
        <div className="w-full overflow-hidden border-t border-neutral-100 bg-neutral-50 py-12">
          <h1 className="text-[12vw] leading-[0.8] font-serif text-neutral-200 text-center tracking-tighter opacity-50 select-none pointer-events-none pb-4">
            OMENAI
          </h1>
        </div>
      </div>
    </footer>
  );
}
