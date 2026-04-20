"use client";

import { SidebarContent } from "./SidebarComponent";

export function DesktopSidebar() {
  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 bg-white transition-all duration-300 md:block border-r border-neutral-100">
      <SidebarContent />
    </aside>
  );
}
