"use client";
import React, { useState, useEffect } from "react";
import { Activity, RefreshCw } from "lucide-react";

interface BlockerProps {
  paymentGateway: "stripe" | "flutterwave";
  message?: string;
  expiryTimestamp?: string;
}

function Blocker({
  message = "We’re fine-tuning our payment system to resolve a minor issue and ensure every transaction remains flawlessly seamless.",
}: Omit<BlockerProps, "paymentGateway">) {
  return (
    <div className="relative min-h-[80vh] w-full bg-[#0f172a] overflow-hidden rounded font-sans flex flex-col items-center justify-center p-6 border border-[#47748E]/20  shadow-2xl">
      {/* --- Fluid Background --- */}
      {/* Rotating Radar Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(42,158,223,0.08)_0%,transparent_70%)]" />

      {/* Expanding Ripples */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-[#2A9EDF]/10 rounded-full animate-[ping_4s_linear_infinite]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] border border-[#2A9EDF]/10 rounded-full animate-[ping_4s_linear_infinite] delay-1000" />

      {/* --- Central Art: The Pulse --- */}
      <div className="relative z-10 mb-10">
        <div className="relative w-20 h-20 flex items-center justify-center">
          {/* Background Glow */}
          <div className="absolute inset-0 bg-[#2A9EDF]/20 rounded-full blur-xl animate-pulse"></div>

          {/* The Icon Container */}
          <div className="relative w-16 h-16 bg-[#0f172a] border border-[#2A9EDF]/50 rounded-full flex items-center justify-center shadow-lg z-10">
            <Activity className="w-8 h-8 text-[#2A9EDF]" />
          </div>

          {/* Orbital Dot */}
          <div className="absolute w-full h-full animate-[spin_4s_linear_infinite]">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#ffffff] rounded-full shadow-[0_0_10px_#fff]"></div>
          </div>
        </div>
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] tracking-[0.2em] text-[#47748E] font-semibold uppercase whitespace-nowrap">
          Payment Gateway
        </div>
      </div>

      {/* --- Content --- */}
      <h2 className="text-white text-[clamp(1.422rem,1.2vw+1.2rem,1.602rem)] font-light mb-3">
        Payment Transaction System{" "}
        <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#2A9EDF] to-[#FCFCFC]">
          Paused
        </span>
      </h2>

      <p className="text-[#818181] text-center max-w-md text-[clamp(0.889rem,0.5vw+0.8rem,1rem)] leading-relaxed mb-8">
        {message}
      </p>
      <p className="text-[#818181] text-center max-w-md text-[clamp(0.889rem,0.5vw+0.8rem,1rem)] leading-relaxed mb-8">
        Thank you for your patience as we work to enhance your payment
        experience ❤️
      </p>

      {/* --- Timer Display --- */}
      {/* {expiryTimestamp && !time.isExpired && (
        <div className="flex flex-col items-center">
          <div className="flex gap-4 text-white font-light text-2xl">
            <div className="flex flex-col items-center">
              <span>{time.hours}</span>
              <span className="text-[9px] text-[#47748E] uppercase tracking-wider mt-1">
                Hrs
              </span>
            </div>
            <span className="text-[#2A9EDF]">:</span>
            <div className="flex flex-col items-center">
              <span>{time.minutes}</span>
              <span className="text-[9px] text-[#47748E] uppercase tracking-wider mt-1">
                Min
              </span>
            </div>
            <span className="text-[#2A9EDF]">:</span>
            <div className="flex flex-col items-center">
              <span className="text-[#2A9EDF] font-medium">{time.seconds}</span>
              <span className="text-[9px] text-[#2A9EDF] uppercase tracking-wider mt-1">
                Sec
              </span>
            </div>
          </div>
        </div>
      )} */}

      {/* --- Footer Status --- */}
      <div className="mt-10 flex items-center gap-2 px-4 py-1 rounded-full bg-[#2A9EDF]/5 border border-[#2A9EDF]/10">
        <RefreshCw
          className="w-3 h-3 text-[#2A9EDF] animate-spin"
          style={{ animationDuration: "3s" }}
        />
        <span className="text-[10px] text-[#47748E] font-medium tracking-wide">
          Maintenance ongoing...
        </span>
      </div>
    </div>
  );
}

export default function PaymentBlocker() {
  return <Blocker />;
}
