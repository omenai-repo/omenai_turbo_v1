import Image from "next/image";
import React from "react";

export default function AppStoreAd() {
  return (
    // 1. DARKROOM CONTAINER
    <section className="relative w-full overflow-hidden bg-neutral-950 py-8 md:py-24 lg:py-32">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="flex flex-col items-center justify-center text-center">
          {/* 2. TYPOGRAPHY */}
          <div className="mb-12 max-w-3xl space-y-6">
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-neutral-500">
              Omenai Mobile
            </span>

            <h1 className="font-serif text-5xl font-light leading-[1.1] text-white md:text-7xl lg:text-8xl">
              The Collection. <br />
              <span className="italic text-neutral-400">Anywhere.</span>
            </h1>

            <p className="mx-auto max-w-lg font-sans text-sm leading-relaxed text-neutral-400">
              Experience OMENAI without boundaries. High-resolution viewing and
              instant access to our curators. Available now on iOS and Android.
            </p>
          </div>

          {/* 3. VISUAL: The Monolith */}
          <div className="relative mb-14 flex w-full justify-center">
            {/* Atmospheric Glow */}
            <div className="absolute top-1/2 left-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded bg-white/5 blur-[100px]" />

            <div className="relative z-10 w-[280px] md:w-[320px]">
              <Image
                src={"/images/store_ad.png"}
                width={320}
                height={600}
                alt="Omenai Mobile App Interface"
                className="h-auto w-full object-contain drop-shadow-2xl"
              />
            </div>
          </div>

          {/* 4. DUAL STORE BADGES */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
            <button className="group relative h-[50px] overflow-hidden transition-transform duration-300 hover:scale-105 active:scale-95">
              <Image
                src={"/images/google_play.png"}
                width={160}
                height={50}
                alt="Get it on Google Play"
                className="h-full w-auto object-contain opacity-90 transition-opacity group-hover:opacity-100"
              />
            </button>

            {/* Google Play Store */}
            <button className="group relative h-[50px] overflow-hidden transition-transform duration-300 hover:scale-105 active:scale-95">
              <Image
                src={
                  "https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg"
                }
                width={80}
                height={30}
                alt="Get it on Google Play"
                className="h-full w-auto object-contain opacity-90 transition-opacity group-hover:opacity-100"
              />
            </button>
          </div>

          <span className="mt-8 font-mono text-[9px] uppercase tracking-widest text-neutral-700">
            Check it out
          </span>
        </div>
      </div>
    </section>
  );
}
