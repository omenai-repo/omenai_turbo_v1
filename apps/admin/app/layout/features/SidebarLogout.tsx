// components/layout/SidebarLogout.tsx
import { LogOut } from "lucide-react";
import clsx from "clsx";

export function SidebarLogout({
  isMobile,
  onLogout,
}: {
  isMobile: boolean;
  onLogout: () => void;
}) {
  return (
    <div
      className={clsx(
        "mt-auto",
        isMobile ? "px-3 pb-4" : "pb-4 w-full flex justify-center",
      )}
    >
      <button
        onClick={onLogout}
        className={clsx(
          "group flex w-full transition-all duration-200 focus:outline-none",
          isMobile
            ? "flex-row items-center gap-3 rounded-lg px-3 py-2.5 text-red-500 hover:bg-red-50 hover:text-red-600"
            : "flex-col items-center justify-center rounded-xl mx-2 py-2.5 text-red-400 hover:bg-red-500/15 hover:text-red-300", // Floating pill for desktop
        )}
      >
        <LogOut
          className={clsx(
            "flex-shrink-0 transition-transform",
            isMobile
              ? "h-[18px] w-[18px]"
              : "mb-1.5 h-[18px] w-[18px] group-hover:-translate-y-0.5",
          )}
        />
        <span
          className={clsx(
            isMobile
              ? "text-sm font-medium"
              : "text-[9px] leading-tight tracking-wider text-center font-medium",
          )}
        >
          Log out
        </span>
      </button>
    </div>
  );
}
