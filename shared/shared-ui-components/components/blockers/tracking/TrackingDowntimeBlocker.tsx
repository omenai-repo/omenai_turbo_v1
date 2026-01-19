"use client";
import React, { useState } from "react";
import { Package, Globe, Clipboard, Check, MapPin, Loader } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

/**
 * Props for the Blocker Screen
 */
interface TrackingBlockerProps {
  message?: string;
  trackingNumber?: string;
  externalLink?: string;
  externalLinkText?: string;
}

/**
 * Helper function to copy text to clipboard using the modern Clipboard API.
 * This is an asynchronous operation.
 */
const copyToClipboard = async (
  text: string,
  setCopied: (value: boolean) => void
) => {
  try {
    // Use the modern Clipboard API (navigator.clipboard)
    await navigator.clipboard.writeText(text);

    // Set state to show the success icon briefly
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  } catch (err) {
    // This typically fails if the environment is not a secure context (HTTPS)
    // or if clipboard permissions are denied.
    console.error(
      "Could not copy text to clipboard. Ensure site is running in a secure context (https).",
      err
    );
  }
};

export default function ShipmentTrackingBlocker({
  message = "Our internal route optimization engine is under maintenance, causing a temporary delay in real-time tracking updates. We apologize for the inconvenience.",
  trackingNumber = "GM1234567890XX",
  externalLink = "https://www.dhl.com/global-en/home/tracking.html",
  externalLinkText = "Track on DHL Global Website",
}: TrackingBlockerProps) {
  const [copied, setCopied] = useState(false);

  const router = useRouter();
  return (
    <div className="relative min-h-screen w-full bg-[#0f172a] overflow-hidden font-sans flex flex-col items-center justify-center p-6 border border-[#47748E]/20 shadow-2xl">
      {/* --- Background Map/Line Motif --- */}
      <div
        className="absolute inset-0 opacity-5 "
        style={{
          backgroundImage:
            "linear-gradient(to right, #47748E 1px, transparent 1px), linear-gradient(to bottom, #47748E 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      ></div>

      {/* --- Central Art: Package Handoff --- */}
      <div className="relative z-30 mb-8">
        <div className="relative w-24 h-24 flex items-center justify-center">
          {/* Outer Ring (Pulse/Active) */}
          <div
            className="absolute inset-0 border-4 border-[#2A9EDF]/20 rounded animate-ping-slow"
            style={{ animationDuration: "4s" }}
          ></div>

          {/* Main Icon Container */}
          <div className="relative w-20 h-20 bg-[#0f172a] border-4 border-[#2A9EDF] rounded flex items-center justify-center shadow-lg z-10">
            <Package className="w-10 h-10 text-[#2A9EDF] transition-transform duration-500 hover:rotate-6" />
          </div>

          {/* Loader/Transfer Indicator */}
          <div className="absolute -bottom-2 -right-2 bg-[#0f172a] p-1 rounded border border-[#47748E]">
            <Loader className="w-4 h-4 text-[#818181] animate-spin" />
          </div>
        </div>
      </div>

      {/* --- Content --- */}
      <h2 className="z-30 text-white text-center text-[clamp(1.422rem,1.2vw+1.2rem,1.602rem)] font-bold tracking-tight mb-3">
        Tracking Service{" "}
        <span className="text-[#2A9EDF]">Temporarily Offline</span>
      </h2>

      <p className="z-30 text-[#47748E] text-center max-w-md text-[clamp(0.889rem,0.5vw+0.8rem,1rem)] leading-relaxed mb-8">
        {message}
      </p>

      {/* --- Tracking Number Section --- */}
      <div className="z-30 bg-[#1f2937] p-4 rounded w-full max-w-sm shadow-xl border border-[#47748E]/30 mb-6">
        <p className="text-xs text-[#818181] uppercase tracking-widest mb-2 font-medium">
          Your Shipment Tracking Number
        </p>
        <div className="flex justify-between items-center">
          <span className="text-white font-mono text-lg select-all">
            {trackingNumber}
          </span>
          <button
            onClick={() => copyToClipboard(trackingNumber, setCopied)}
            className={`p-2 rounded transition-all duration-200 ${copied ? "bg-[#10b981] text-white" : "bg-[#2A9EDF]/10 text-[#2A9EDF] hover:bg-[#2A9EDF]/20"}`}
            title="Copy Tracking Number"
          >
            {copied ? (
              <Check className="w-4 h-4" />
            ) : (
              <Clipboard className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* --- External Link Call to Action --- */}
      <div className="z-30 mt-4 w-full max-w-sm">
        <p className="text-sm text-[#818181] mb-3">
          For immediate tracking, please use the provided link:
        </p>
        <Link
          href={externalLink}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full inline-flex items-center justify-center py-3 px-6 bg-[#2A9EDF] text-white font-medium text-[clamp(0.79rem,0.35vw+0.7rem,0.889rem)] rounded hover:bg-opacity-90 transition-all shadow-[0_4px_15px_rgba(42,158,223,0.4)]"
        >
          <Globe className="w-4 h-4 mr-2" />
          {externalLinkText}
        </Link>
        <button
          onClick={() => router.back()}
          className="w-full inline-flex items-center justify-center py-3 px-6 bg-dark text-white font-medium text-[clamp(0.79rem,0.35vw+0.7rem,0.889rem)] rounded hover:bg-opacity-90 transition-all mt-4 border hover:border-[#2A9EDF] shadow-[0_4px_15px_rgba(42,158,223,0.2)]"
        >
          <Globe className="w-4 h-4 mr-2" />
          Go Back
        </button>
        <p className="mt-4 text-[10px] text-[#47748E] uppercase tracking-widest">
          Our service will be restored shortly.
        </p>
      </div>
    </div>
  );
}
