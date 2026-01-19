import Image from "next/image";
import ArtistLoginForm from "../features/artistForm/Form";
import { IndividualLogo } from "@omenai/shared-ui-components/components/logo/Logo";
import Link from "next/link";

export const dynamic = "force-dynamic";

function Page() {
  return (
    <section className="h-screen w-full bg-white overflow-hidden flex flex-col md:flex-row">
      {/* --- Left Side: The Visual Anchor (40%) --- */}
      <div className="relative hidden md:flex w-[40%] h-full bg-slate-50 p-6 flex-col justify-between">
        {/* Logo/Home Link */}
        <IndividualLogo />

        {/* Framed Image Container */}
        <div className="relative w-full h-[75%] rounded overflow-hidden shadow-2xl border-[12px] border-white">
          <Image
            src="/artist__banner.png"
            alt="Omenai Gallery Visual"
            fill
            priority
            className="object-cover transition-transform duration-[10s] hover:scale-110"
          />
          {/* Subtle overlay for depth */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

          {/* Image Caption - Makes it feel like an editorial */}
          <div className="absolute bottom-6 left-6 text-white">
            <p className="text-xs uppercase tracking-widest opacity-80 mb-1">
              Featured Collection
            </p>
            <p className="text-fluid-base font-light">
              Contemporary Resonance, 2024
            </p>
          </div>
        </div>

        {/* Footer info for the side section */}
        <div className="relative z-20">
          <p className="text-[10px] text-slate-400 max-w-[200px] leading-relaxed uppercase tracking-tighter">
            Connecting global collectors with the world&apos;s most exceptional
            artists.
          </p>
        </div>
      </div>

      {/* --- Right Side: The Interaction Space (60%) --- */}
      <section className="flex-1 h-full bg-white relative flex flex-col">
        {/* Top Navigation Hook (Premium standard) */}
        <div className="w-full p-8 flex justify-end items-center gap-4 relative z-20">
          <span className="text-xs text-slate-400 uppercase tracking-widest">
            New to Omenai?
          </span>
          <Link
            href="/register"
            className="text-xs font-bold uppercase tracking-widest border-b border-black pb-1 hover:text-slate-500 hover:border-slate-500 transition-colors"
          >
            Create Account
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
                Welcome Back
              </h1>
              <p className="text-slate-500 text-fluid-xs font-light">
                Please enter your details to access your Artist account.
              </p>
            </div>

            {/* The actual Form component */}
            <ArtistLoginForm />
          </div>
        </div>

        {/* Minimal Bottom Branding */}
        <div className="p-8 flex justify-between items-center text-[10px] text-slate-300 tracking-[0.3em] uppercase">
          <span>&copy; 2026 OMENAI INC.</span>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-dark transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-dark transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </section>
    </section>
  );
}

export default Page;
