"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { OmenaiLogoCut } from "../logo/Logo";

export default function AndroidSmartBanner() {
  const [isMounted, setIsMounted] = useState(false);
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    // 1. Tell React we are safely on the client
    setIsMounted(true);

    // 2. Perform all browser-specific checks inside the effect
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isAndroidDevice = /android/.test(userAgent);
    const isDismissed = sessionStorage.getItem("omenai_main_banner_dismissed");

    if (isAndroidDevice && !isDismissed) {
      setShouldShow(true);
    }
  }, []);

  const handleDismiss = () => {
    sessionStorage.setItem("omenai_main_banner_dismissed", "true");
    setShouldShow(false);
  };

  // Strictly prevent hydration errors by rendering nothing until mounted
  if (!isMounted || !shouldShow) return null;

  const intentUrl =
    "intent://home#Intent;scheme=omenaimobile;package=com.omenai.omenaiapp;end;";

  return (
    <div className="relative z-[50] flex items-center justify-between bg-white px-4 py-2 shadow-sm border-b border-zinc-100">
      <div className="flex items-center gap-3">
        <button
          onClick={handleDismiss}
          className="p-1 text-zinc-400 hover:text-zinc-700 transition-colors"
          aria-label="Close banner"
        >
          <X size={18} />
        </button>

        <div className="h-5 w-5 overflow-hidden rounded-md bg-zinc-50 border border-zinc-100 flex items-center justify-center">
          <OmenaiLogoCut />
        </div>

        <div className="flex flex-col">
          <span className="text-sm font-medium text-dark leading-tight">
            Omenai
          </span>
          <span className="text-[9px] text-neutral-400">
            Contemporary African Art, in your pocket.
          </span>
        </div>
      </div>

      <a
        href={intentUrl}
        className="rounded-full bg-[#091830] px-5 py-1 text-[10px] font-medium text-white transition-opacity hover:opacity-90"
      >
        Get the app
      </a>
    </div>
  );
}
