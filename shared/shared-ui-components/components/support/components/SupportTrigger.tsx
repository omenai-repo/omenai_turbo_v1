import React from "react";
import { Sparkles } from "lucide-react";

export function SupportTrigger({ onClick }: { onClick: () => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-center gap-3">
      <style>{`
        @keyframes breathe-glow {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.1); }
        }
        @keyframes pulse-ring-blue {
          0% { transform: scale(0.8); opacity: 0.5; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        @keyframes float-icon {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-2px) rotate(5deg); }
        }
      `}</style>

      {/* Tooltip */}
      <div className="absolute bottom-full mb-4 px-4 py-2 bg-[#091830] text-white shadow-xl shadow-blue-900/20 rounded-xl opacity-0 translate-y-2 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap hidden md:block border border-blue-900/30">
        <div className="flex items-center gap-2.5 text-[11px] font-semibold tracking-widest uppercase">
          <span>Ask Advisor</span>
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
        </div>
        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-[#091830]" />
      </div>

      <button
        onClick={onClick}
        className="group relative flex items-center justify-center w-14 h-14 cursor-pointer transition-transform duration-300 hover:scale-105 active:scale-95"
        aria-label="Open Omenai Advisor"
      >
        <div
          className="absolute inset-0 rounded-full border border-blue-500/30"
          style={{
            animation: "pulse-ring-blue 3s cubic-bezier(0, 0, 0.2, 1) infinite",
          }}
        />

        <div
          className="absolute -inset-1 rounded-full blur-md opacity-75 transition-opacity duration-500 bg-gradient-to-tr from-blue-600 via-[#091830] to-cyan-600"
          style={{ animation: "breathe-glow 4s ease-in-out infinite" }}
        />

        <div className="relative w-full h-full rounded-full bg-slate-900 border border-white/10 shadow-2xl flex items-center justify-center overflow-hidden z-10">
          <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          <div
            className="text-white relative z-20"
            style={{ animation: "float-icon 5s ease-in-out infinite" }}
          >
            <Sparkles
              size={24}
              strokeWidth={1.5}
              className="drop-shadow-[0_0_8px_#091830]"
            />
          </div>
        </div>

        <div className="absolute top-0 right-0 z-20">
          <span className="flex h-3.5 w-3.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-[2.5px] border-[#FDFDFD]" />
          </span>
        </div>
      </button>
    </div>
  );
}
