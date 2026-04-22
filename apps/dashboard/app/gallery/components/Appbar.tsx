// components/layout/Appbar.tsx
"use client";

import DashboardIndicator from "./DashboardIndicator";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { Search } from "lucide-react";
import { useEffect } from "react";

export default function Appbar() {
  const { user } = useAuth({ requiredRole: "gallery" });

  // Dispatches a custom event to open our Command Menu component
  const openCommandMenu = () => {
    window.dispatchEvent(new CustomEvent("open-command-menu"));
  };

  return (
    <div className="w-full pb-4 mb-4 border-b border-neutral-100 flex justify-between">
      {/* Top Utility Row */}
      <div className="flex justify-end items-center mb-3">
        <button
          onClick={openCommandMenu}
          className="w-full md:w-72 flex items-center justify-between bg-neutral-50 hover:bg-neutral-100 border border-neutral-300 text-neutral-500 px-4 py-2 rounded-sm  transition-colors group"
        >
          <div className="flex items-center gap-2 text-sm">
            <Search
              size={14}
              className="text-neutral-400 group-hover:text-neutral-600 transition-colors"
            />
            <span>Search or jump to...</span>
          </div>
          <div className="flex items-center gap-1 opacity-60">
            <kbd className="text-[10px] font-sans border border-neutral-300 rounded-sm  px-1.5 py-0.5 bg-white">
              ⌘
            </kbd>
            <kbd className="text-[10px] font-sans border border-neutral-300 rounded-sm  px-1.5 py-0.5 bg-white">
              K
            </kbd>
          </div>
        </button>
      </div>

      <DashboardIndicator
        admin_name={user.admin as string}
        gallery_name={user.name}
        gallery_verified={user.gallery_verified as boolean}
      />
    </div>
  );
}
