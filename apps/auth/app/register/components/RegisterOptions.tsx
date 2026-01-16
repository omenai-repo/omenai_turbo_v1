"use client";
import { useLowRiskFeatureFlag } from "@omenai/shared-hooks/hooks/useConfigCatFeatureFlag";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React from "react";
import {
  BuildingLibraryIcon,
  PaintBrushIcon,
  UserPlusIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

export default function RegisterOptions() {
  const { value: waitlistActivated } = useLowRiskFeatureFlag(
    "waitlistActivated",
    true
  );
  const params = useSearchParams();
  const redirectTo = params.get("redirect") || "";

  const CARD_STYLE = `
    group relative flex flex-col justify-between p-6 h-[160px] 
    border border-slate-300 rounded-2xl bg-white 
    transition-all duration-500 ease-in-out
    hover:border-black hover:shadow-2xl hover:shadow-black/5
  `;

  const ICON_STYLE = `
    w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center 
    text-slate-500 group-hover:bg-black group-hover:text-white 
    transition-colors duration-300
  `;

  return (
    <div className="w-full space-y-4">
      {/* Top Row: Gallery and Artist */}
      <div className="grid grid-cols-1 xs:grid-cols-2 gap-4">
        {/* Gallery Option */}
        <Link
          href={
            waitlistActivated ? "/waitlist?entity=gallery" : "/register/gallery"
          }
          className={CARD_STYLE}
        >
          <div className={ICON_STYLE}>
            <BuildingLibraryIcon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">
              {waitlistActivated ? "Limited Access" : "For Institutions"}
            </p>
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold tracking-tight">Gallery</h3>
              <ChevronRightIcon className="w-4 h-4 text-slate-400 group-hover:text-black group-hover:translate-x-1 transition-all" />
            </div>
          </div>
        </Link>

        {/* Artist Option */}
        <Link
          href={
            waitlistActivated ? "/waitlist?entity=artist" : "/register/artist"
          }
          className={CARD_STYLE}
        >
          <div className={ICON_STYLE}>
            <PaintBrushIcon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">
              {waitlistActivated ? "Waitlist" : "For Creators"}
            </p>
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold tracking-tight">Artist</h3>
              <ChevronRightIcon className="w-4 h-4 text-slate-400 group-hover:text-black group-hover:translate-x-1 transition-all" />
            </div>
          </div>
        </Link>
      </div>

      {/* Primary Path: Collector */}
      <Link
        href={`/register/user?redirect=${redirectTo}`}
        className={`${CARD_STYLE} h-auto py-8 border-slate-200`}
      >
        <div className="space-y-6">
          <div className={ICON_STYLE}>
            <UserPlusIcon className="w-5 h-5" />
          </div>
          <div className="flex justify-between items-center">
            <div className="flex-1">
              <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">
                Begin Collecting
              </p>
              <h3 className="text-sm font-bold tracking-tight">
                Register as Collector
              </h3>
            </div>
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-[10px] uppercase font-bold tracking-tighter">
                Start
              </span>
              <ChevronRightIcon className="w-4 h-4 text-black group-hover:translate-x-1 transition-all" />
            </div>
          </div>
        </div>
      </Link>

      {/* Subtle Login Link */}
      <div className="pt-6">
        <Link
          href="/login"
          className="group flex  items-center gap-2 transition-colors"
        >
          <p className="text-[9px] uppercase tracking-[0.3em] text-slate-400 font-medium">
            Already a member?
          </p>
          <span className="text-[11px] uppercase tracking-[0.2em] text-black font-semibold border-b border-black pb-0.5 group-hover:text-slate-500 group-hover:border-slate-500 transition-all">
            Secure Login
          </span>
        </Link>
      </div>
    </div>
  );
}
