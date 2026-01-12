import { LogOut } from "lucide-react";

export function SidebarLogout({
  expanded,
  onLogout,
}: {
  expanded: boolean;
  onLogout: () => void;
}) {
  return (
    <div className="mt-auto px-2 pb-4">
      <button
        onClick={onLogout}
        className={`
          group flex w-full items-center gap-3 rounded-xl px-3 py-2
          text-red-500 transition-all duration-200
          hover:bg-red-50 hover:text-red-600
          focus:outline-none focus:ring-2 focus:ring-red-200
        `}
      >
        {/* Icon */}
        <LogOut
          size={18}
          className="flex-shrink-0 transition-transform group-hover:-translate-x-0.5"
        />

        {/* Label */}
        {expanded && (
          <span className="text-xs font-medium tracking-wide">Log out</span>
        )}
      </button>
    </div>
  );
}
