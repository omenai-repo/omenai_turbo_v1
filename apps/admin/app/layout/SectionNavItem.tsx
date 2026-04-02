// components/layout/SectionNavItem.tsx
import React, { useState } from "react";
import Link from "next/link";
import { clsx } from "clsx";
import { ChevronDown } from "lucide-react";
import { SidebarItem } from "./navMockData";

export function SectionNavItem({
  sectionName,
  sectionIcon: Icon,
  items,
  pathname,
  isMobile,
}: {
  sectionName: string;
  sectionIcon: any;
  items: SidebarItem[];
  pathname: string;
  isMobile: boolean;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const isSingleItem = items.length === 1;
  const isActive = items.some((item) => pathname.startsWith(item.href));

  // THE SLEEK TRIGGER: Rounded floating boxes, dark theme colors
  const TriggerContent = (
    <div
      className={clsx(
        "flex w-full cursor-pointer transition-all duration-200 rounded-lg p-4 font-semibold",
        isMobile
          ? "flex-row items-center justify-start gap-3 "
          : "flex-col items-center justify-center", // mx-2 makes it a floating pill!
        isActive
          ? isMobile
            ? "bg-dark text-white "
            : "bg-white/15 text-white  shadow-sm" // Active state on dark sidebar
          : isMobile
            ? "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
            : "text-slate-400 hover:bg-white/10 hover:text-white", // Inactive state on dark sidebar
      )}
    >
      <Icon
        className={clsx(
          "shrink-0",
          isMobile ? "h-[18px] w-[18px]" : "mb-1.5 h-[18px] w-[18px]",
        )}
      />
      <span
        className={clsx(
          isMobile
            ? "text-sm "
            : "text-[9px] leading-tight tracking-wider text-center break-words",
        )}
      >
        {sectionName}
      </span>
      {isMobile && !isSingleItem && (
        <ChevronDown
          className={clsx(
            "ml-auto h-4 w-4 transition-transform",
            mobileOpen && "rotate-180",
          )}
        />
      )}
    </div>
  );

  if (isSingleItem) {
    return (
      <li className="list-none relative group flex justify-center">
        <Link href={items[0].href} className="block w-full">
          {TriggerContent}
        </Link>
      </li>
    );
  }

  if (isMobile) {
    return (
      <li className="flex list-none flex-col">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="w-full text-left"
        >
          {TriggerContent}
        </button>
        {mobileOpen && (
          <ul className="mt-1 flex flex-col gap-0.5 px-3 pb-2">
            {items.map((item) => {
              const isItemActive = pathname.startsWith(item.href);
              const ItemIcon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={clsx(
                      "flex items-center rounded-md px-3 py-2 text-[13px] transition-colors",
                      isItemActive
                        ? "bg-neutral-100  text-dark"
                        : "text-neutral-600 hover:bg-neutral-50",
                    )}
                  >
                    <ItemIcon className="mr-2.5 h-[15px] w-[15px] shrink-0" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </li>
    );
  }

  return (
    <li className="group relative list-none flex justify-center">
      {TriggerContent}

      {/* DARK THEME POPOVER: Matches the sidebar aesthetic */}
      <div className="absolute left-[calc(100%+16px)] top-0 z-50 hidden w-56 rounded-xl border border-dark bg-dark p-3 shadow-2xl group-hover:block before:absolute before:-left-4 before:top-0 before:h-full before:w-4 before:bg-transparent">
        <div className="mb-2 px-2 pb-2 pt-1 text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-dark">
          {sectionName}
        </div>
        <ul className="space-y-2">
          {items.map((item) => {
            const isItemActive = pathname.startsWith(item.href);
            const ItemIcon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={clsx(
                    "flex items-center rounded-md px-3 py-2 text-xs transition-colors",
                    isItemActive
                      ? "bg-dark font-semibold text-white"
                      : "text-slate-300 hover:bg-white/5 hover:text-white",
                  )}
                >
                  <ItemIcon className="mr-2.5 h-[14px] w-[14px] shrink-0 opacity-80" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </li>
  );
}
