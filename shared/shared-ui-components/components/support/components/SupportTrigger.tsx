import { Icons } from "../util";

export function SupportTrigger({ onClick }: { onClick: () => void }) {
  return (
    <div className="fixed bottom-8 right-8 z-[9999] flex flex-col items-center gap-2">
      {/* 1. The Circular Trigger Button */}
      <button
        onClick={onClick}
        className="group relative flex items-center justify-center w-14 h-14 bg-dark text-white rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_40px_rgb(0,0,0,0.16)] transition-all duration-500 hover:scale-110 active:scale-95 border border-white/10"
        style={{ animation: "float 3s ease-in-out infinite" }}
        aria-label="Open Support"
      >
        <style>{`
          @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-4px); } }
        `}</style>

        {/* The Question Mark Icon */}
        <div className="relative">
          <Icons.Help />{" "}
          {/* Ensure this icon is sized appropriately, e.g. w-6 h-6 */}
          {/* The Pulse Dot (Status Indicator) */}
          <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400 border border-dark"></span>
          </span>
        </div>
      </button>

      {/* 2. The Tooltip (Appears on Hover) */}
      <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 px-3 py-1.5 bg-white text-dark text-xs font-medium rounded-lg shadow-xl opacity-0 translate-x-[-10px] group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap border border-slate-100 hidden md:block">
        Need Help?
        {/* Little arrow pointing left */}
        <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-white transform rotate-45 border-l border-b border-slate-100"></div>
      </div>
    </div>
  );
}
