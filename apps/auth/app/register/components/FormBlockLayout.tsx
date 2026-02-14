"use client";
import { base_url } from "@omenai/url-config/src/config";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
export default function FormBlockLayout({
  entity,
  children,
}: Readonly<{
  entity: string;
  children: React.ReactNode;
}>) {
  return (
    <AnimatePresence key={74}>
      <motion.section
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ y: 100 }}
        transition={{ duration: 0.33 }}
        className="flex-1 h-full  bg-white relative overflow-y-scroll flex flex-col"
      >
        {/* Top Navigation Hook (Premium standard) */}
        <div className="w-full p-8 flex justify-end items-center gap-4 relative z-20">
          <span className="text-xs text-slate-400 uppercase tracking-widest">
            Already have an account?
          </span>
          <Link
            href="/login"
            className="text-xs font-bold uppercase tracking-widest border-b border-dark pb-1 hover:text-slate-500 hover:border-slate-500 transition-colors"
          >
            Login
          </Link>
        </div>
        {/* Form Centering Container */}
        <div className="flex-1 flex items-center justify-center p-6 md:p-12 lg:p-20 relative">
          {/* Subtle Background Grain or Gradient (Optional replacement for dots) */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]" />

          <div className="w-full max-w-[480px] relative z-10">
            {/* Header section inside the form area for better context */}
            <div className="mb-10 space-y-2">
              <h1 className="text-fluid-xl font-light tracking-tight text-slate-900">
                Create {entity} account
              </h1>
              <p className="text-slate-500 text-fluid-xs font-light">
                Please fill your information below
              </p>
            </div>

            {/* The actual Form component */}
            {children}
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
              href={`${base_url()}/legal?ent=${entity}`}
              target="_blank"
              className="hover:text-dark transition-colors"
            >
              Terms of use
            </Link>
          </div>
        </div>
      </motion.section>
    </AnimatePresence>
  );
}
