import React from "react";
import { Sparkles, X } from "lucide-react";

export const BubbleHeader = ({ onClose }: { onClose: () => void }) => {
  return (
    <div className="relative bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 p-6 flex items-center justify-between text-white shrink-0 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-2 left-[15%] w-20 h-20 bg-indigo-500/20 rounded-full blur-xl animate-float"
          style={{ animationDelay: "0s", animationDuration: "8s" }}
        />
        <div
          className="absolute top-8 right-[20%] w-16 h-16 bg-purple-500/20 rounded-full blur-lg animate-float"
          style={{ animationDelay: "2s", animationDuration: "10s" }}
        />
        <div
          className="absolute -top-8 left-[45%] w-24 h-24 bg-pink-500/15 rounded-full blur-2xl animate-float"
          style={{ animationDelay: "1s", animationDuration: "12s" }}
        />
        <div
          className="absolute -top-11 left-[45%] w-24 h-24 bg-pink-500/15 rounded-full blur-2xl animate-float"
          style={{ animationDelay: "1s", animationDuration: "12s" }}
        />

        {/* Medium bubbles */}
        <div
          className="absolute top-2 right-[40%] w-12 h-12 bg-cyan-400/20 rounded-full blur-md animate-float-slow"
          style={{ animationDelay: "3s", animationDuration: "9s" }}
        />
        <div
          className="absolute top-10 left-[60%] w-14 h-14 bg-violet-500/20 rounded-full blur-lg animate-float-slow"
          style={{ animationDelay: "1.5s", animationDuration: "11s" }}
        />
        <div
          className="absolute top-4 left-[60%] w-14 h-14 bg-violet-500/20 rounded-full blur-lg animate-float-slow"
          style={{ animationDelay: "1.5s", animationDuration: "11s" }}
        />

        {/* Small bubbles */}
        <div
          className="absolute top-5 left-[30%] w-8 h-8 bg-blue-400/25 rounded-full blur-sm animate-float"
          style={{ animationDelay: "0.5s", animationDuration: "7s" }}
        />
        <div
          className="absolute top-1 right-[55%] w-10 h-10 bg-fuchsia-400/20 rounded-full blur-md animate-float-slow"
          style={{ animationDelay: "2.5s", animationDuration: "9.5s" }}
        />
        <div
          className="absolute top-7 left-[75%] w-9 h-9 bg-emerald-400/20 rounded-full blur-sm animate-float"
          style={{ animationDelay: "4s", animationDuration: "8.5s" }}
        />
        <div
          className="absolute top-9 left-[75%] w-9 h-9 bg-emerald-400/20 rounded-full blur-sm animate-float"
          style={{ animationDelay: "4s", animationDuration: "8.5s" }}
        />
        <div
          className="absolute top-3 left-[75%] w-9 h-9 bg-emerald-400/20 rounded-full blur-sm animate-float"
          style={{ animationDelay: "4s", animationDuration: "8.5s" }}
        />
      </div>

      {/* Gradient Overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none" />

      {/* Content */}
      <div className="flex items-center gap-2 relative z-10">
        {/* Icon with enhanced glow */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-xl blur-md opacity-75 group-hover:opacity-100 transition-opacity" />
          <div className="relative p-3 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-600 rounded-xl shadow-xl shadow-indigo-500/40 transform group-hover:scale-105 transition-transform">
            <Sparkles size={22} className="text-white drop-shadow-lg" />
          </div>
        </div>

        {/* Text Content */}
        <div>
          <h3 className="text-fluid-xs font-medium tracking-wide bg-gradient-to-r from-white via-purple-100 to-pink-100 bg-clip-text text-transparent drop-shadow-sm">
            Omenai Advisor
          </h3>
          <p className="text-fluid-xxs text-slate-300/90 flex items-center gap-2 font-medium uppercase tracking-widest mt-0.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400 shadow-lg shadow-emerald-400/50" />
            </span>
            Live Assistant
          </p>
        </div>
      </div>

      {/* Close Button */}
      <button
        onClick={onClose}
        className="relative z-10 group hover:bg-white/10 p-2.5 rounded-xl transition-all duration-300 text-slate-300 hover:text-white backdrop-blur-sm border border-white/15 hover:border-white/20"
      >
        <X
          size={20}
          className="group-hover:rotate-90 transition-transform duration-300"
        />
      </button>

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0) translateX(0) scale(1);
            opacity: 0.3;
          }
          25% {
            transform: translateY(-20px) translateX(10px) scale(1.1);
            opacity: 0.5;
          }
          50% {
            transform: translateY(-10px) translateX(-10px) scale(0.9);
            opacity: 0.4;
          }
          75% {
            transform: translateY(-25px) translateX(5px) scale(1.05);
            opacity: 0.6;
          }
        }

        @keyframes float-slow {
          0%,
          100% {
            transform: translateY(0) translateX(0) scale(1) rotate(0deg);
            opacity: 0.25;
          }
          33% {
            transform: translateY(-15px) translateX(-8px) scale(1.08)
              rotate(5deg);
            opacity: 0.4;
          }
          66% {
            transform: translateY(-8px) translateX(12px) scale(0.95)
              rotate(-5deg);
            opacity: 0.35;
          }
        }

        .animate-float {
          animation: float ease-in-out infinite;
        }

        .animate-float-slow {
          animation: float-slow ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default BubbleHeader;
