import Image from "next/image";
import React from "react";
import RegisterOptionSection from "./components/RegisterOptionSection";
import Link from "next/link";
import { IndividualLogo } from "@omenai/shared-ui-components/components/logo/Logo";

export const dynamic = "force-dynamic";

function Page() {
  return (
    <section className="h-screen w-full bg-white overflow-hidden flex flex-col md:flex-row">
      {/* --- Left Side: The Visual Anchor (40%) --- */}
      <div className="relative hidden md:flex w-[40%] h-full bg-slate-50 p-8 flex-col justify-between border-r border-slate-100">
        <IndividualLogo />

        {/* The "Masterpiece Frame" - Using the gallery banner */}
        <div className="relative w-full h-[70%] rounded overflow-hidden shadow-2xl border-[12px] border-white">
          <Image
            src="/gallery__banner.png"
            alt="Omenai Curator Space"
            fill
            priority
            className="object-cover transition-transform duration-[20s] ease-linear hover:scale-110"
          />
          {/* Lighter overlay for a more "inviting" feel compared to login */}
          <div className="absolute inset-0 bg-dark/10 hover:bg-transparent transition-colors duration-700" />
        </div>

        {/* Side Footer Quote */}
        <div className="relative z-20">
          <p className="text-[10px] text-slate-400 uppercase tracking-widest leading-relaxed max-w-[250px] italic">
            "Art is the stored spirit of a civilization."
          </p>
        </div>
      </div>

      {/* --- Right Side: The Interaction Space (60%) --- */}
      <section className="flex-1 h-full bg-white relative flex flex-col overflow-y-auto">
        {/* Top Navigation Hook */}
        <div className="w-full p-8 flex justify-end items-center gap-4 relative z-20">
          <span className="text-[10px] text-slate-400 uppercase tracking-[0.2em]">
            Member already?
          </span>
          <Link
            href="/login"
            className="text-[10px] font-bold uppercase tracking-[0.2em] border-b border-dark pb-1 hover:text-slate-500 hover:border-slate-500 transition-colors"
          >
            Sign In
          </Link>
        </div>

        {/* Center Content: Entity Selection */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 lg:px-24">
          <div className="w-full max-w-[540px]">
            {/* Elegant Header */}
            <div className="mb-12 text-center md:text-left">
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-400 mb-4">
                Onboarding
              </p>
              <h1 className="text-fluid-xl md:text-fluid-2xl font-light tracking-tight text-slate-900 mb-6 leading-tight">
                Begin your journey.
              </h1>
              <p className="text-slate-500 text-fluid-xs tracking-wide font-light max-w-md">
                Choose the profile that best describes your presence in the art
                world.
              </p>
            </div>

            {/* Registration Options Component */}
            <RegisterOptionSection />
          </div>
        </div>

        {/* Bottom Metadata */}
        <div className="p-8 flex justify-between items-center text-[10px] text-slate-300 tracking-[0.3em] uppercase">
          <span>&copy; 2026 OMENAI INC.</span>
          <div className="flex gap-6">
            <Link href="/terms" className="hover:text-dark">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-dark">
              Privacy
            </Link>
          </div>
        </div>
      </section>
    </section>
  );
}

export default Page;
