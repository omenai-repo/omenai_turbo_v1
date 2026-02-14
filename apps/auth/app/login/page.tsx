import Image from "next/image";
import React from "react";
import LoginOptionWrapper from "./components/LoginOptionWrapper";
import Link from "next/link";
import { IndividualLogo } from "@omenai/shared-ui-components/components/logo/Logo";

export const dynamic = "force-dynamic";

function Page() {
  return (
    <section className="h-auto w-full bg-white">
      <div className="flex justify-between items-center px-4 py-6">
        <IndividualLogo />
        <div className="w-full hidden md:flex justify-end items-center gap-4 relative z-20">
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
      </div>
      <div className="h-full grid place-items-center">
        <div className="w-full max-w-[520px] animate-in fade-in slide-in-from-bottom-4 duration-700">
          {/* Editorial Heading */}
          <div className="mb-12 text-center md:text-left">
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-400 mb-4">
              Onboarding
            </p>
            <h1 className="text-fluid-xl md:text-fluid-2xl font-light tracking-tight text-slate-900 mb-6 leading-tight">
              Login to your portal
            </h1>
            <p className="text-slate-500 text-sm tracking-wide font-light">
              Select your account type to access your personalized workspace.
            </p>
          </div>

          {/* Entity Selection Cards Container */}
          <div className="px-4">
            <LoginOptionWrapper />
          </div>
        </div>
      </div>

      <div className="flex absolute bottom-5 left-5 justify-between items-center text-[10px] text-slate-300 tracking-[0.3em] uppercase">
        <span>&copy; 2026 OMENAI INC.</span>{" "}
      </div>
    </section>
  );
}

export default Page;
