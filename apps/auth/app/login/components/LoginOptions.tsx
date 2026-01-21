"use client";
import Link from "next/link";
import React from "react";
import {
  BuildingLibraryIcon,
  PaintBrushIcon,
  UserIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";

export default function LoginOptions() {
  const CARD_STYLE = `
    group relative flex flex-col justify-between p-6 h-[140px] 
    border border-slate-200 rounded bg-white 
    transition-all duration-500 ease-in-out
    hover:border-dark hover:shadow-xl hover:shadow-black/5
  `;

  const ICON_WRAPPER = `
    w-10 h-10 rounded bg-slate-50 flex items-center justify-center 
    text-slate-500 group-hover:bg-dark group-hover:text-white 
    transition-colors duration-300
  `;

  return (
    <div className="w-full space-y-4">
      {/* Top Row: Gallery and Artist (Partners) */}
      <div className="grid grid-cols-1 xs:grid-cols-2 gap-4">
        <Link href="/login/gallery" className={CARD_STYLE}>
          <div className={ICON_WRAPPER}>
            <BuildingLibraryIcon className="w-5 h-5" />
          </div>
          <div className="flex justify-between items-end">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">
                Portal
              </p>
              <h3 className="text-sm font-bold tracking-tight">Gallery</h3>
            </div>
            <ArrowRightIcon className="w-4 h-4 text-slate-400 group-hover:text-dark group-hover:translate-x-1 transition-all" />
          </div>
        </Link>

        <Link href="/login/artist" className={CARD_STYLE}>
          <div className={ICON_WRAPPER}>
            <PaintBrushIcon className="w-5 h-5" />
          </div>
          <div className="flex justify-between items-end">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">
                Creative
              </p>
              <h3 className="text-sm font-bold tracking-tight">Artist</h3>
            </div>
            <ArrowRightIcon className="w-4 h-4 text-slate-400 group-hover:text-dark group-hover:translate-x-1 transition-all" />
          </div>
        </Link>
      </div>

      {/* Primary Role: Collector */}
      <Link
        href="/login/user"
        className={`${CARD_STYLE} h-auto py-8 border-slate-300`}
      >
        <div className="space-y-2">
          <div className={ICON_WRAPPER}>
            <UserIcon className="w-5 h-5" />
          </div>
          <div className="flex justify-between items-end">
            <div className="flex-1">
              <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">
                Experience Art
              </p>
              <h3 className="text-sm font-bold tracking-tight">
                Login as Collector
              </h3>
            </div>
            <ArrowRightIcon className="w-4 h-4 text-slate-400 group-hover:text-dark group-hover:translate-x-1 transition-all" />
          </div>
        </div>
      </Link>

      {/* Secondary Action: Registration */}
      <div className="pt-6">
        <Link
          href="/register"
          className="group flex items-center justify-center w-full transition-colors"
        >
          <p className="text-[9px] uppercase tracking-[0.25em] text-slate-500 group-hover:text-dark transition-colors font-medium">
            Don&apos;t have an account?{" "}
            <span className="text-dark border-b border-dark ml-2">
              Join Omenai
            </span>
          </p>
        </Link>
      </div>
    </div>
  );
}
