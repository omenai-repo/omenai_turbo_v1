// components/layout/DesktopSidebar.tsx
"use client";

import { useState } from "react";
import clsx from "clsx";
import { SidebarContent } from "./SidebarComponent";

export function DesktopSidebar() {
  const [expanded, setExpanded] = useState(false);

  return (
    <aside
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      className={clsx(
        "fixed left-0 top-0 z-40 hidden h-screen bg-white transition-all duration-300 md:block",
        expanded ? "w-64" : "w-16"
      )}
      style={{
        borderRight: "1px solid rgba(0,0,0,0.04)",
      }}
    >
      <SidebarContent expanded={expanded} />
    </aside>
  );
}
