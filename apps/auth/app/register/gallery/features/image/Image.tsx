import { IndividualLogo } from "@omenai/shared-ui-components/components/logo/Logo";
import Image from "next/image";

export default function ImageBlock() {
  return (
    <div className="relative hidden md:flex w-[40%] h-full bg-slate-50 p-6 flex-col justify-between">
      {/* Logo/Home Link */}
      <IndividualLogo />

      {/* Framed Image Container */}
      <div className="relative w-full h-[75%] rounded overflow-hidden shadow-2xl border-[12px] border-white">
        <Image
          src="/gallery__banner.png"
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
  );
}
