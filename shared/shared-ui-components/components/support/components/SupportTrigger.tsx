import React from "react";
import { Icons } from "../util";

export function SupportTrigger({ onClick }: { onClick: () => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-center gap-3">
      {/* Styles & Keyframes - Scaled down movement distances */}
      <style>{`
        @keyframes deep-blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(10px, -15px) scale(1.1); }
          66% { transform: translate(-8px, 10px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes shimmer-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes pulse-ring {
          0% { transform: scale(0.8); opacity: 0.5; }
          100% { transform: scale(2.2); opacity: 0; }
        }
      `}</style>

      {/* Tooltip */}
      <div className="absolute bottom-full mb-3 px-3 py-1.5 bg-[#091830] text-white border border-blue-800/30 shadow-lg rounded-lg opacity-0 translate-y-2 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap hidden md:block">
        <div className="flex items-center gap-2 text-xs font-medium tracking-wide">
          <span>Support</span>
          <div className="w-1 h-1 rounded-full bg-blue-400 animate-pulse" />
        </div>
        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-[#091830]" />
      </div>

      <button
        onClick={onClick}
        // Size changed from w-20 h-20 to w-14 h-14 (Standard FAB size)
        className="group relative flex items-center justify-center w-14 h-14 rounded-full transition-all duration-500 hover:scale-110 hover:-translate-y-1 active:scale-95 cursor-pointer"
        aria-label="Open Support"
      >
        {/* 1. External Pulse Ring */}
        <div
          className="absolute inset-0 rounded-full border border-blue-500/30"
          style={{
            animation: "pulse-ring 3s cubic-bezier(0, 0, 0.2, 1) infinite",
          }}
        />

        {/* 2. Deep Ambient Glow */}
        <div
          className="absolute inset-1 rounded-full blur-lg opacity-60 transition-opacity duration-500 group-hover:opacity-80"
          style={{ background: "#091830" }}
        />

        {/* 3. The Main Fluid Container */}
        <div
          className="relative w-full h-full rounded-full overflow-hidden shadow-xl isolate border border-white/10"
          style={{ backgroundColor: "#091830" }}
        >
          {/* Fluid 1: Electric Blue */}
          <div
            className="absolute -top-2 -left-2 w-10 h-10 rounded-full mix-blend-screen filter blur-lg opacity-50 animate-blob"
            style={{
              backgroundColor: "#3b82f6",
              animation: "deep-blob 7s infinite",
            }}
          />

          {/* Fluid 2: Rich Navy */}
          <div
            className="absolute top-0 -right-2 w-12 h-12 rounded-full mix-blend-screen filter blur-lg opacity-40 animate-blob"
            style={{
              backgroundColor: "#1e40af",
              animation: "deep-blob 9s infinite reverse",
              animationDelay: "2s",
            }}
          />

          {/* Fluid 3: Cyan Spark */}
          <div
            className="absolute -bottom-2 left-2 w-8 h-8 rounded-full mix-blend-screen filter blur-lg opacity-30 animate-blob"
            style={{
              backgroundColor: "#06b6d4",
              animation: "deep-blob 5s infinite ease-in-out",
              animationDelay: "4s",
            }}
          />

          {/* 4. Rotating Sheen */}
          <div
            className="absolute inset-[-50%] bg-gradient-to-t from-transparent via-white/10 to-transparent pointer-events-none"
            style={{ animation: "shimmer-spin 6s linear infinite" }}
          />
        </div>

        {/* 5. Glass Overlay & Icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Inner circle resized to w-10 h-10 */}
          <div className="w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-[1px] border border-white/10 shadow-[inset_0_0_10px_rgba(255,255,255,0.05)] group-hover:bg-white/5 transition-colors duration-300">
            <div className="text-white transform transition-all duration-500 group-hover:scale-110 drop-shadow-[0_0_5px_rgba(59,130,246,0.6)]">
              {/* Icon resized to w-5 h-5 */}
              <Icons.Help />
            </div>
          </div>
        </div>

        {/* 6. Status Dot */}
        <div className="absolute top-1 right-1">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500 border-2 border-[#091830]"></span>
          </span>
        </div>
      </button>
    </div>
  );
}
