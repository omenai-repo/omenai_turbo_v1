import React from "react";
import { SidebarItem } from "./navMockData";
import Link from "next/link";
import { clsx } from "clsx";
import { Lock } from "lucide-react";

export default function NavigationItem({
  item,
  active,
  icon,
  expanded,
  disabled,
}: {
  item: SidebarItem;
  active: boolean;
  icon: React.ReactNode;
  expanded: boolean;
  disabled: boolean;
}) {
  return (
    <li key={item.href}>
      {disabled ? (
        <div
          aria-disabled="true"
          className={clsx(
            "flex cursor-not-allowed items-center rounded-lg px-3 py-2.5 text-sm text-neutral-400",
            "bg-neutral-50"
          )}
        >
          {icon}

          {expanded && (
            <span className="ml-3 flex items-center gap-2 whitespace-nowrap">
              {item.label}
              <Lock className="h-3.5 w-3.5 opacity-70" />
            </span>
          )}
        </div>
      ) : (
        <Link
          href={item.href}
          className={clsx(
            "flex items-center rounded-lg px-3 py-2.5 text-sm transition-colors",
            active
              ? "bg-dark text-white"
              : "text-neutral-600 hover:bg-neutral-100"
          )}
        >
          {icon}

          {expanded && (
            <span className="ml-3 whitespace-nowrap">{item.label}</span>
          )}
        </Link>
      )}
    </li>
  );
}
