import React, { useState, useEffect } from "react";
import { ArrowLeft, Clock, Palette } from "lucide-react";
import { dashboard_url } from "@omenai/url-config/src/config";

/**
 * Props for the Blocker Screen
 * passed from your ConfigCat hooks in _app.tsx or the parent component
 */
interface ArtworkBlockerProps {
  entity: "artist" | "gallery";
  message?: string;

  expiryTimestamp?: string; // ISO 8601 format (e.g., "2025-11-18T15:00:00Z")
}

export default function ArtworkUploadBlocker({
  message = "We are currently working on some fixes and curating your upload experience.",
  expiryTimestamp = "2025-11-18T18:00:00Z",
  entity,
}: ArtworkBlockerProps) {
  const [timeLeft, setTimeLeft] = useState<{
    hours: string;
    minutes: string;
    seconds: string;
    isExpired: boolean;
  }>({ hours: "00", minutes: "00", seconds: "00", isExpired: false });

  // --- Timer Logic ---
  useEffect(() => {
    if (!expiryTimestamp) return;

    const calculateTime = () => {
      const expiry = new Date(expiryTimestamp).getTime();
      const now = new Date().getTime();
      const distance = expiry - now;

      if (distance < 0) {
        return { hours: "00", minutes: "00", seconds: "00", isExpired: true };
      }

      const hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      return {
        hours: String(hours).padStart(2, "0"),
        minutes: String(minutes).padStart(2, "0"),
        seconds: String(seconds).padStart(2, "0"),
        isExpired: false,
      };
    };

    // Initial calculation
    setTimeLeft(calculateTime());

    const interval = setInterval(() => {
      const calculated = calculateTime();
      setTimeLeft(calculated);
      if (calculated.isExpired) clearInterval(interval);
    }, 1000);

    return () => clearInterval(interval);
  }, [expiryTimestamp]);

  return (
    <div className="relative min-h-[90vh] w-full bg-[#0f172a] overflow-hidden font-sans flex items-center justify-center selection:bg-[#2A9EDF] selection:text-white">
      {/* --- Artistic Background Effects --- */}
      {/* Rotating Aurora Blob 1 */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-[#2A9EDF]/20 rounded-full blur-[120px] animate-pulse duration-[8000ms]" />
      {/* Rotating Aurora Blob 2 */}
      <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-[#2A9EDF]/10 rounded-full blur-[100px] animate-pulse duration-[10000ms] delay-1000" />

      {/* Grid Pattern Overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "radial-gradient(#818181 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      ></div>

      {/* --- Main Content Container --- */}
      <div className="relative z-10 w-full max-w-3xl px-6 md:px-12 flex flex-col items-center text-center">
        {/* 1. The Icon / Art Piece */}
        <div className="mb-8 relative group">
          <div className="absolute inset-0 bg-[#2A9EDF]/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-700"></div>
          <div className="relative w-20 h-20 md:w-24 md:h-24 bg-[#0f172a] border border-[#47748E]/30 rounded-2xl flex items-center justify-center backdrop-blur-md shadow-2xl">
            <Palette
              className="w-10 h-10 md:w-12 md:h-12 text-[#2A9EDF] animate-[spin_10s_linear_infinite]"
              style={{ animationDuration: "20s" }}
            />
          </div>
        </div>

        {/* 2. The Headline */}
        <h1 className="text-white font-bold text-[clamp(1.602rem,1.5vw+1.3rem,1.802rem)] md:text-[clamp(1.802rem,2vw+1.4rem,2.027rem)] tracking-tight mb-4 leading-[1.1]">
          The Upload Canvas is{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2A9EDF] to-[#47748E]">
            Paused
          </span>
        </h1>

        {/* 3. The Message (ConfigCat Dynamic Text) */}
        <p className="text-[#47748E] text-[clamp(0.889rem,0.5vw+0.8rem,1rem)] md:text-[clamp(1.125rem,0.8vw+1rem,1.266rem)] max-w-xl mx-auto leading-relaxed mb-10">
          {message}
        </p>

        {/* 4. The Timer Section (Only shows if timestamp exists) */}
        {expiryTimestamp && !timeLeft.isExpired && (
          <div className="w-full max-w-lg">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Clock className="w-4 h-4 text-[#818181]" />
              <span className="text-[#818181] uppercase tracking-widest text-xs font-semibold">
                Artwork Upload will be available In
              </span>
            </div>

            {/* Timer Grid */}
            <div className="grid grid-cols-3 gap-4 md:gap-8">
              {/* Hours */}
              <div className="flex flex-col items-center">
                <div className="relative bg-[#0f172a]/50 border border-[#47748E]/20 rounded-lg w-full h-20 md:h-24 flex items-center justify-center overflow-hidden">
                  <span className="text-[clamp(1.602rem,1.5vw+1.3rem,1.802rem)] font-light text-white tabular-nums">
                    {timeLeft.hours}
                  </span>
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-[#2A9EDF]/30"></div>
                </div>
                <span className="mt-2 text-xs text-[#818181] uppercase tracking-wider">
                  Hours
                </span>
              </div>

              {/* Minutes */}
              <div className="flex flex-col items-center">
                <div className="relative bg-[#0f172a]/50 border border-[#47748E]/20 rounded-lg w-full h-20 md:h-24 flex items-center justify-center overflow-hidden">
                  <span className="text-[clamp(1.602rem,1.5vw+1.3rem,1.802rem)] font-light text-white tabular-nums">
                    {timeLeft.minutes}
                  </span>
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-[#2A9EDF]/60"></div>
                </div>
                <span className="mt-2 text-xs text-[#818181] uppercase tracking-wider">
                  Minutes
                </span>
              </div>

              {/* Seconds */}
              <div className="flex flex-col items-center">
                <div className="relative bg-[#0f172a]/50 border border-[#2A9EDF]/30 rounded-lg w-full h-20 md:h-24 flex items-center justify-center overflow-hidden shadow-[0_0_15px_rgba(42,158,223,0.15)]">
                  <span className="text-[clamp(1.602rem,1.5vw+1.3rem,1.802rem)] font-medium text-[#2A9EDF] tabular-nums">
                    {timeLeft.seconds}
                  </span>
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-[#2A9EDF] animate-pulse"></div>
                </div>
                <span className="mt-2 text-xs text-[#2A9EDF] uppercase tracking-wider">
                  Seconds
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 5. Expired State (If timer runs out but flag is still on) */}
        {timeLeft.isExpired && expiryTimestamp && (
          <div className="mt-6 py-3 px-6 bg-[#2A9EDF]/10 border border-[#2A9EDF]/20 rounded-full">
            <p className="text-[#2A9EDF] font-medium animate-pulse">
              We are coming back online any moment now...
            </p>
          </div>
        )}

        {/* 6. Return Action */}
        <div className="mt-16">
          {/* Replaced next/link with 'a' to fix preview error. Use Link in your real app. */}
          <a
            href={`${dashboard_url()}${entity === "artist" ? "/artist/app/artworks" : "/gallery/artworks"}`}
            className="group flex items-center space-x-2 text-[#818181] hover:text-white transition-colors duration-300"
          >
            <ArrowLeft className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" />
            <span className="text-[clamp(0.79rem,0.35vw+0.7rem,0.889rem)] font-medium tracking-wide">
              Go Back
            </span>
          </a>
        </div>
      </div>
    </div>
  );
}
