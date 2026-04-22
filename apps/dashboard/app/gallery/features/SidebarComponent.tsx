// components/layout/SidebarComponent.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import {
  sidebarItems,
  SidebarSection,
} from "../navigations/NavigationMockData";
import { IndividualLogo } from "@omenai/shared-ui-components/components/logo/Logo";
import { toast } from "sonner";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { SidebarLogout } from "./SidebarLogout";
import { Search } from "lucide-react";

export function SidebarContent() {
  const pathname = usePathname();
  const { signOut } = useAuth({ requiredRole: "gallery" });

  async function handleSignOut() {
    toast.info("Signing out...", {
      description: "You will be redirected to the login page",
    });
    await signOut();
  }

  // Group sections for rendering
  const sections: { id: SidebarSection; label: string | null }[] = [
    { id: "general", label: null }, // No header for the top general links
    { id: "inventory", label: "Inventory" },
    { id: "programming", label: "Programming" },
    { id: "operations", label: "Operations" },
    { id: "configuration", label: "Configuration" },
  ];

  return (
    <div className="flex h-full flex-col px-6 py-8 overflow-y-auto custom-scrollbar">
      {/* Logo */}
      <div className="flex items-center mb-8">
        <IndividualLogo />
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-10">
        {sections.map((section) => {
          const items = sidebarItems.filter(
            (item) => item.section === section.id,
          );
          if (items.length === 0) return null;

          return (
            <div key={section.id}>
              {section.label && (
                <h3 className="text-[10px] font-medium tracking-[0.2em] uppercase text-neutral-400 mb-4 px-2">
                  {section.label}
                </h3>
              )}

              <ul className="space-y-1">
                {items.map((item) => {
                  const active = pathname.startsWith(item.href);

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={clsx(
                          "relative block rounded-sm   px-2 py-2 text-sm transition-all duration-300",
                          active
                            ? "text-neutral-900 font-medium translate-x-1"
                            : "text-neutral-500 hover:text-neutral-900",
                        )}
                      >
                        {/* Subtle Active Indicator */}
                        {active && (
                          <span className="absolute -left-2 top-1/2 -translate-y-1/2 w-1 h-1 bg-neutral-900 rounded-sm -full" />
                        )}
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      <SidebarLogout onLogout={handleSignOut} />
    </div>
  );
}
