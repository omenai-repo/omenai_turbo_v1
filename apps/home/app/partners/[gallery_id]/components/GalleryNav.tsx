"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const GalleryNav = ({ galleryId }: { galleryId: string }) => {
  const pathname = usePathname();

  const tabs = [
    { name: "Overview", path: `/partners/${galleryId}` }, // Root path
    { name: "Works", path: `/partners/${galleryId}/works` },
    { name: "Shows & Fairs", path: `/partners/${galleryId}/shows` },
    { name: "Artists", path: `/partners/${galleryId}/artists` },
    { name: "Contact", path: `/partners/${galleryId}/contact` },
  ];

  return (
    <nav className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-neutral-200 transition-all duration-300">
      <div className="max-w-[1600px] mx-auto px-4">
        <ul className="flex items-center gap-8 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            // Check if active. Exact match for Overview, partial match for nested routes.
            const isActive =
              tab.name === "Overview"
                ? pathname === tab.path
                : pathname?.startsWith(tab.path);

            return (
              <li key={tab.name} className="shrink-0">
                <Link
                  href={tab.path}
                  className={`block py-5 font-sans text-xs uppercase tracking-[0.15em] font-normal transition-colors relative ${
                    isActive ? "text-dark" : "text-neutral-500 hover:text-dark"
                  }`}
                >
                  {tab.name}
                  {/* Active Indicator Underline */}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 w-full h-[2px] bg-dark" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
};
