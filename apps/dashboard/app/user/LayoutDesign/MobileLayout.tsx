// components/layout/MobileSidebar.tsx
"use client";

import { Menu, X } from "lucide-react";
import { useState } from "react";
import { SidebarContent } from "./SidebarComponent";
import { IndividualLogo } from "@omenai/shared-ui-components/components/logo/Logo";

export function MobileSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="w-full flex justify-between items-center pt-3">
        <IndividualLogo />
        <button onClick={() => setOpen(true)} className="md:hidden">
          <Menu />
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />

          {/* Drawer */}
          <aside className="relative z-50 h-full w-64 bg-white">
            <button
              onClick={() => setOpen(false)}
              className="absolute right-4 top-4"
            >
              <X />
            </button>

            {/* 🔑 Mobile is ALWAYS expanded */}
            <SidebarContent expanded handleClick={() => setOpen(false)} />
          </aside>
        </div>
      )}
    </>
  );
}
