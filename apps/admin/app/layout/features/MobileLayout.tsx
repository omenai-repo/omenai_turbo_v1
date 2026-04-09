// components/layout/MobileSidebar.tsx
"use client";

import { Menu, X } from "lucide-react";
import { useState } from "react";
import { SidebarContent } from "./SidebarComponent";

export function MobileSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)} className="md:hidden">
        <Menu />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-dark/40"
            onClick={() => setOpen(false)}
          />

          <aside className="relative z-50 h-full w-64 bg-white">
            <button
              onClick={() => setOpen(false)}
              className="absolute right-4 top-4"
            >
              <X />
            </button>

            {/* Render as mobile drawer layout */}
            <SidebarContent isMobile={true} />
          </aside>
        </div>
      )}
    </>
  );
}
