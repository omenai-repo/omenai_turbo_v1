// components/layout/DesktopSidebar.tsx
"use client";

import { SidebarContent } from "./SidebarComponent";

export function DesktopSidebar() {
  return (
    <aside
      className="fixed left-2 top-1/2 z-40 hidden h-[98vh] w-[72px] -translate-y-1/2 rounded-xl bg-slate-900 shadow-2xl shadow-slate-900/20 md:block transition-none"
      style={{
        border: "1px solid rgba(255,255,255,0.1)", // Changed to a full border
      }}
    >
      <SidebarContent isMobile={false} />
    </aside>
  );
}
