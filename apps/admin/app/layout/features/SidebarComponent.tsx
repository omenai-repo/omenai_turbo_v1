// components/layout/SidebarComponent.tsx
"use client";
import { usePathname } from "next/navigation";
import {
  IndividualLogo,
  OmenaiLogoCut,
} from "@omenai/shared-ui-components/components/logo/Logo";
import { toast } from "sonner";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { SidebarLogout } from "./SidebarLogout";
import { SidebarItem, sidebarItems } from "../navMockData";
import { canAccessRoute } from "../../utils/canAccessRoute";

// Import top-level section icons
import { Layers, Activity, Users, Settings } from "lucide-react";
import { SectionNavItem } from "../SectionNavItem";

const SECTION_CONFIG: Record<string, { label: string; icon: any }> = {
  actions: { label: "Operations", icon: Layers },
  activity: { label: "Activity", icon: Activity },
  management: { label: "Admin", icon: Users },
  account: { label: "Settings", icon: Settings },
};

export function SidebarContent({ isMobile }: { isMobile: boolean }) {
  const pathname = usePathname();
  const { signOut, user } = useAuth({ requiredRole: "admin" });

  async function handleSignOut() {
    toast.info("Signing out...", {
      description: "You will be redirected to the login page",
    });
    await signOut();
  }

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center justify-center px-4">
        {isMobile ? <IndividualLogo /> : <OmenaiLogoCut />}
      </div>

      <nav className="mt-4 flex flex-1 flex-col gap-2 px-2 pb-4">
        {Object.entries(SECTION_CONFIG).map(([sectionKey, config]) => {
          // 1. DYNAMIC ROLE FILTERING
          const accessibleItems = sidebarItems.filter(
            (item: SidebarItem) =>
              item.section === sectionKey &&
              canAccessRoute(user.access_role, item.key),
          );

          // Hide completely if the role has no access to this section
          if (accessibleItems.length === 0) return null;

          return (
            <SectionNavItem
              key={sectionKey}
              sectionName={config.label}
              sectionIcon={config.icon}
              items={accessibleItems}
              pathname={pathname}
              isMobile={isMobile}
            />
          );
        })}
      </nav>

      <div className="shrink-0">
        <SidebarLogout isMobile={isMobile} onLogout={handleSignOut} />
      </div>
    </div>
  );
}
