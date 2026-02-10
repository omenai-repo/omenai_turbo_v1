import Image from "next/image";
import React from "react";
import { BsQrCode } from "react-icons/bs";

export default function AppStoreAd() {
  return (
    <section className="w-full bg-[#091830] overflow-hidden">
      <div className="p-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12 pt-16 md:pt-24 pb-0">
          {/* 1. CONTENT COLUMN */}
          <div className="flex-1 max-w-xl text-left pb-16 md:pb-24">
            <div className="flex items-center gap-3 mb-6">
              <span className="flex items-center justify-center h-8 w-8 rounded-full bg-white/10 text-white">
                <BsQrCode className="text-sm" />
              </span>
              <span className="font-sans text-xs font-bold uppercase tracking-wider text-white/60">
                Omenai Mobile
              </span>
            </div>
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-white leading-[1.1] mb-6">
              Discover and collect Contemporary African Art, anywhere
            </h2>

            <p className="font-sans text-white/70 text-base leading-relaxed mb-8 max-w-md">
              Discover artists, save works you love, and manage your
              collections, from Anywhere
            </p>

            {/* Store Buttons */}
            <div className="flex flex-wrap items-center gap-4">
              <button className="group relative h-[45px] transition-transform hover:-translate-y-1">
                <Image
                  src="/images/google_play.png"
                  width={150}
                  height={45}
                  alt="Get it on Google Play"
                  className="h-full w-auto object-contain"
                />
              </button>

              <button className="group relative h-[45px] transition-transform hover:-translate-y-1">
                <Image
                  src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg"
                  width={150}
                  height={45}
                  alt="Download on the App Store"
                  className="h-full w-auto object-contain"
                />
              </button>
            </div>
          </div>

          {/* 2. VISUAL COLUMN */}
          {/* Image bleeds off the bottom for a dynamic look */}
          <div className="flex-1 relative w-full flex justify-center md:justify-end">
            <div className="relative w-[280px] md:w-[340px] lg:w-[380px] translate-y-10 md:translate-y-0">
              {/* Background Glow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[#4F75FF]/20 blur-[80px] rounded-full pointer-events-none" />

              <Image
                src="/images/store_ad.png"
                width={400}
                height={800}
                alt="Omenai Mobile App Interface"
                className="relative z-10 w-full h-auto drop-shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
