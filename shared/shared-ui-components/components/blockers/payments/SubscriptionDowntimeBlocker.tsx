import React from "react";
import { Settings, ZapOff, CheckSquare, RefreshCcw } from "lucide-react";

/**
 * Props for the Blocker Screen
 */
interface SubscriptionBlockerProps {
  message?: string;
}

export default function SubscriptionBillingBlocker({
  message = "Our billing system is currently undergoing a crucial stability update. We're working quickly to finalize the changes and will be back online shortly.",
}: SubscriptionBlockerProps) {
  // Custom Keyframes for a smooth, slow rotation of the gear
  const keyframes = `
    @keyframes spin-slow {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `;

  return (
    <div className="relative min-h-[90vh] w-full bg-[#0f172a] overflow-hidden font-sans flex flex-col items-center justify-center p-6 border border-[#47748E]/20 rounded shadow-2xl">
      {/* Inject custom CSS for slow rotation */}
      <style>{keyframes}</style>

      {/* --- Background Elements: Blueprint Grid & Faint Pulse --- */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #47748E 1px, transparent 1px), linear-gradient(to bottom, #47748E 1px, transparent 1px)",
          backgroundSize: "30px 30px",
        }}
      ></div>

      {/* Faint Pulse effect */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-[#2A9EDF]/5 to-transparent animate-pulse opacity-10"
        style={{ animationDuration: "6s" }}
      ></div>

      {/* --- Central Art: Maintenance Gear --- */}
      <div className="relative z-10 mb-10">
        <div className="relative w-24 h-24 flex items-center justify-center">
          {/* Main Gear Icon (Slow Rotation) */}
          <Settings
            className="w-16 h-16 text-[#2A9EDF] opacity-70"
            style={{ animation: "spin-slow 20s linear infinite" }}
          />

          {/* Overlay Status Icon (Centered Alert) */}
          <div className="absolute p-1 bg-[#0f172a] rounded">
            <RefreshCcw
              className="w-6 h-6 text-[#2A9EDF] animate-spin"
              style={{ animationDuration: "2s" }}
            />
          </div>

          {/* Secondary smaller gear/detail */}
          <div className="absolute -bottom-4 -right-4 bg-[#0f172a] p-2 rounded border-2 border-[#47748E]/50">
            <CheckSquare className="w-4 h-4 text-[#47748E]" />
          </div>
        </div>

        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-[10px] tracking-[0.3em] text-[#47748E] font-mono uppercase whitespace-nowrap">
          Subscriptions and Billing
        </div>
      </div>

      {/* --- Content --- */}
      <h2 className="text-white text-[clamp(1.422rem,1.2vw+1.2rem,1.602rem)] font-bold tracking-tight mb-3 mt-4">
        Billing System <span className="text-[#2A9EDF]">Under Maintenance</span>
      </h2>

      <p className="text-[#47748E] text-center max-w-md text-[clamp(0.889rem,0.5vw+0.8rem,1rem)] leading-relaxed mb-10">
        {message}
      </p>

      {/* --- Footer Status Bar --- */}
      <div className="w-full max-w-xs h-2 bg-[#47748E]/20 rounded overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#2A9EDF] to-white/50 rounded animate-pulse"
          style={{ width: "35%" }} // Static progress bar to show work is underway
        ></div>
      </div>
      <p className="mt-2 text-xs text-[#818181] font-medium tracking-wide">
        Working on a fix. Thank you for your patience.
      </p>
    </div>
  );
}
