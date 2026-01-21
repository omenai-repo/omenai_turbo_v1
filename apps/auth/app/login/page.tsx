import Image from "next/image";
import React from "react";
import LoginOptionWrapper from "./components/LoginOptionWrapper";
import Link from "next/link";
import { IndividualLogo } from "@omenai/shared-ui-components/components/logo/Logo";

export const dynamic = "force-dynamic";

function Page() {
  return (
    <section className="h-screen w-full bg-white overflow-hidden flex flex-col md:flex-row">
      {/* --- Left Side: The Visual Anchor (40%) --- */}
      {/* We keep this consistent with the Login page for brand recognition */}
      <div className="relative hidden md:flex w-[40%] h-full bg-slate-50 p-8 flex-col justify-between border-r border-slate-100">
        {/* Branding */}
        <IndividualLogo />

        {/* The "Gallery Frame" Concept */}
        <div className="relative w-full h-[70%] rounded overflow-hidden shadow-2xl border-[12px] border-white">
          <Image
            src="/login_banner.png"
            alt="Omenai Portal"
            fill
            priority
            className="object-cover transition-transform duration-[20s] ease-linear hover:scale-110"
          />
          {/* Subtle vignette for a premium feel */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
        </div>

        {/* Side Footer */}
        <div className="relative z-20">
          <p className="text-[10px] text-slate-400 uppercase tracking-widest leading-relaxed max-w-[250px]">
            The premier digital destination for the global contemporary art
            market.
          </p>
        </div>
      </div>

      {/* --- Right Side: The Selector Space (60%) --- */}
      <section className="flex-1 h-full bg-white relative overflow-y-scroll flex flex-col">
        {/* Secondary Action: Top Right Navigation */}
        <div className="w-full p-8 flex justify-end items-center gap-4 relative z-20">
          <span className="text-[10px] text-slate-400 uppercase tracking-[0.2em]">
            New to the platform?
          </span>
          <Link
            href="/register"
            className="text-[10px] font-bold uppercase tracking-[0.2em] border-b border-dark pb-1 hover:text-slate-500 hover:border-slate-500 transition-colors"
          >
            Join Omenai
          </Link>
        </div>

        {/* Center Content: Selection Cards */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 lg:px-24">
          <div className="w-full max-w-[520px] animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Editorial Heading */}
            <div className="mb-12 text-center md:text-left">
              <h1 className="text-xl md:text-2xl font-normal tracking-tight text-slate-900 mb-4">
                Identify your portal
              </h1>
              <p className="text-slate-500 text-sm tracking-wide font-light">
                Select your account type to access your personalized workspace.
              </p>
            </div>

            {/* Entity Selection Cards Container */}
            <LoginOptionWrapper />
          </div>
        </div>

        {/* Bottom Metadata */}
        <div className="p-8 flex justify-between items-center text-[10px] text-slate-300 tracking-[0.3em] uppercase">
          <span>&copy; 2026 OMENAI INC.</span>
          <div className="flex gap-4">
            <Link href="/help" className="hover:text-dark">
              Support
            </Link>
          </div>
        </div>
      </section>
    </section>
  );
}

export default Page;
