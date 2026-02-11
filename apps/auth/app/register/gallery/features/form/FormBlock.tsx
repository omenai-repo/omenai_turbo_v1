"use client";
import { base_url } from "@omenai/url-config/src/config";
import FormInput from "./components/FormInput";
import Link from "next/link";
export default function FormBlock() {
  return (
    <section className="flex-1 h-full  bg-white relative overflow-y-scroll flex flex-col">
      {/* Form Centering Container */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 lg:p-20 relative">
        {/* Subtle Background Grain or Gradient (Optional replacement for dots) */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]" />

        <div className="w-full max-w-[480px] relative z-10">
          {/* Header section inside the form area for better context */}
          <div className="mb-10 space-y-2">
            <h1 className="text-fluid-xl font-light tracking-tight text-slate-900">
              Create a Gallery account
            </h1>
            <p className="text-slate-500 text-fluid-xs font-light">
              Please fill your information below
            </p>
          </div>

          {/* The actual Form component */}
          <FormInput />
        </div>
      </div>

      {/* Minimal Bottom Branding */}
      <div className="p-8 flex justify-between items-center text-[10px] text-slate-300 tracking-[0.3em] uppercase">
        <span>&copy; 2026 OMENAI INC.</span>
        <div className="flex gap-6">
          <Link
            href={`${base_url()}/privacy`}
            target="_blank"
            className="hover:text-dark transition-colors"
          >
            Privacy
          </Link>
          <Link
            href={`${base_url()}/legal?ent=gallery`}
            target="_blank"
            className="hover:text-dark transition-colors"
          >
            Terms of use
          </Link>
        </div>
      </div>
    </section>
  );
}
