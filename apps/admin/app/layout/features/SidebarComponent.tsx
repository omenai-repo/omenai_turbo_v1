"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import {
  IndividualLogo,
  OmenaiLogoCut,
} from "@omenai/shared-ui-components/components/logo/Logo";
import { toast } from "sonner";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { SidebarLogout } from "./SidebarLogout";
import { SidebarItem, sidebarItems } from "../navMockData";
import NavigationItem from "../NavigationItem";
import { canAccessRoute } from "../../utils/canAccessRoute";

export function SidebarContent({ expanded }: { expanded: boolean }) {
  const pathname = usePathname();
  const { signOut, user } = useAuth({ requiredRole: "admin" });

  async function handleSignOut() {
    toast.info("Signing out...", {
      description: "You will be redirected to the login page",
    });
    await signOut();
    // router.replace(`${auth_uri}/login`);
  }
  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex items-center h-16 px-4">
        {expanded ? <IndividualLogo /> : <OmenaiLogoCut />}
      </div>

      <nav className="flex flex-1 flex-col gap-8 px-3">
        {["actions", "activity", "management", "account"].map((section) => (
          <div key={section}>
            {expanded && (
              <p className="mb-3 px-2 text-[11px] uppercase tracking-wider text-neutral-400">
                {section}
              </p>
            )}

            <ul className="space-y-3">
              {sidebarItems
                .filter((item: SidebarItem) => item.section === section)
                .map((item: SidebarItem) => {
                  const active = pathname.startsWith(item.href);
                  const Icon = item.icon;

                  return (
                    <NavigationItem
                      key={item.label}
                      item={item}
                      active={active}
                      icon={<Icon className="h-4 w-4 shrink-0" />}
                      expanded={expanded}
                      disabled={!canAccessRoute(user.access_role, item.key)}
                    />
                  );
                })}
            </ul>
          </div>
        ))}
      </nav>
      <SidebarLogout expanded={expanded} onLogout={handleSignOut} />
    </div>
  );
}
