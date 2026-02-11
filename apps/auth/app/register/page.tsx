import Image from "next/image";
import React from "react";
import RegisterOptionSection from "./components/RegisterOptionSection";
import Link from "next/link";
import { IndividualLogo } from "@omenai/shared-ui-components/components/logo/Logo";
import { base_url } from "@omenai/url-config/src/config";

export const dynamic = "force-dynamic";

function Page() {
  return (
    <section className="h-auto w-full bg-white">
      <div className="relative px-4 py-6 flex justify-between items-center">
        <IndividualLogo />

        <div className="w-full md:flex hidden justify-end items-center gap-4 relative z-20">
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
      </div>
      {/* Center Content: Entity Selection */}
      <div className="h-full grid place-items-center px-4">
        <div className="w-full max-w-xl">
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
      <div className="p-8 absolute bottom-5 right-5 flex justify-between items-center text-[10px] text-slate-300 tracking-[0.3em] uppercase">
        <span>&copy; 2026 OMENAI INC.</span>
        <div className="flex gap-6">
          <Link
            href={`${base_url()}/legal?ent=collector`}
            className="hover:text-dark"
          >
            Terms of Service
          </Link>
          <Link href={`${base_url()}/privacy`} className="hover:text-dark">
            Privacy
          </Link>
        </div>
      </div>
    </section>
  );
}

export default Page;
