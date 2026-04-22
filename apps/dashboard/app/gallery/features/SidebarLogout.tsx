// components/layout/SidebarLogout.tsx
export function SidebarLogout({ onLogout }: { onLogout: () => void }) {
  return (
    <div className="mt-12 pt-6 border-t border-neutral-100">
      <button
        onClick={onLogout}
        className=" text-left p-2 text-xs w-fit text-white rounded-sm  bg-red-500 hover:text-neutral-900 transition-colors duration-200"
      >
        Log out
      </button>
    </div>
  );
}
