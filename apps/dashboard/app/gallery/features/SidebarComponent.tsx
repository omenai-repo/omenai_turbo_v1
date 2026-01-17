"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { sidebarItems } from "../navigations/NavigationMockData";
import {
  IndividualLogo,
  OmenaiLogoCut,
} from "@omenai/shared-ui-components/components/logo/Logo";
import { toast } from "sonner";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { SidebarLogout } from "./SidebarLogout";

export function SidebarContent({ expanded }: { expanded: boolean }) {
  const pathname = usePathname();
  const { signOut } = useAuth({ requiredRole: "gallery" });

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
        {["core", "finance", "account"].map((section) => (
          <div key={section}>
            {/* {expanded && (
              <p className="mb-3 px-2 text-[11px] uppercase tracking-wider text-neutral-400">
                {section}
              </p>
            )} */}

            <ul className="space-y-3">
              {sidebarItems
                .filter((item) => item.section === section)
                .map((item) => {
                  const active = pathname.startsWith(item.href);
                  const Icon = item.icon;

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={clsx(
                          "flex items-center rounded px-3 py-2.5 text-sm transition-colors",
                          active
                            ? "bg-dark text-white"
                            : "text-neutral-600 hover:bg-neutral-100"
                        )}
                      >
                        <Icon className="h-4 w-4 shrink-0" />

                        {expanded && (
                          <span className="ml-3 whitespace-nowrap">
                            {item.label}
                          </span>
                        )}
                      </Link>
                    </li>
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
