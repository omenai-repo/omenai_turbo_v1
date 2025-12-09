"use client";

import { getPromotionalFileView } from "@omenai/shared-lib/storage/getPromotionalsFileView";
import { PromotionalSchemaTypes } from "@omenai/shared-types";

import Image from "next/image";
import Link from "next/link";
import { IoIosArrowRoundForward } from "react-icons/io";

export default function PromotionalCard({
  headline,
  subheadline,
  cta,
  image,
}: PromotionalSchemaTypes) {
  const image_url = getPromotionalFileView(image, 500, 300);

  return (
    <section
      className="
        group relative w-[300px] sm:w-[420px] h-[180px] md:h-[200px]
        rounded-2xl overflow-hidden
        transition-all duration-700
        cursor-pointer
      "
    >
      {/* ✨ Ambient glow ring */}
      <div
        className="
          pointer-events-none absolute inset-0 rounded-2xl
          ring-1 ring-white/10 group-hover:ring-white/30
          transition-all duration-700
        "
      />

      {/* ✨ Spotlight gradient */}
      <div
        className="
          absolute inset-0 z-10
          bg-gradient-to-br from-black/80 via-black/40 to-black/10
          group-hover:from-black/70 group-hover:via-black/30
          transition-all duration-700
        "
      />

      {/* ✨ Image with cinematic parallax */}
      <div
        className="
          absolute inset-0 z-0
          scale-105
          transition-transform duration-[1200ms]
          group-hover:scale-110
        "
      >
        <Image
          src={image_url}
          width={500}
          height={300}
          alt={headline}
          className="w-full h-full object-cover"
          priority
        />
      </div>

      {/* ✨ Shimmer overlay */}
      <div
        className="
          absolute inset-0 pointer-events-none
          bg-gradient-to-r from-transparent via-white/10 to-transparent
          opacity-0 group-hover:opacity-60
          translate-x-[-100%] group-hover:translate-x-[100%]
          transition-all duration-[1800ms]
        "
      />

      {/* CONTENT */}
      <div className="relative z-20 h-full p-5 flex flex-col justify-between">
        {/* Headlines */}
        <div className="space-y-2">
          <h3
            className="
              text-white text-fluid-base font-semibold leading-tight
              drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]
              translate-y-1 group-hover:translate-y-0
              transition-all duration-700
            "
          >
            {headline}
          </h3>

          <p
            className="
              text-white/90 text-fluid-xs leading-relaxed
              max-w-[85%]
              opacity-80 group-hover:opacity-100
              translate-y-1 group-hover:translate-y-0
              transition-all duration-700 delay-75
            "
          >
            {subheadline}
          </p>
        </div>

        {/* CTA */}
        <Link href={cta} className="w-fit">
          <button
            className="
              group/btn relative flex items-center gap-2
              px-4 py-1.5 rounded-3xl
              text-white text-fluid-xxs font-normal
              bg-white/10 backdrop-blur-md
              border border-white/20
              transition-all duration-500
              hover:bg-white hover:text-black
              hover:border-white
              hover:shadow-[0_0_20px_rgba(255,255,255,0.4)]
              active:scale-95
              overflow-hidden
            "
          >
            <span className="relative z-20">Explore</span>

            <IoIosArrowRoundForward
              className="
                relative z-20 text-lg
                transition-transform duration-500
                group-hover/btn:translate-x-1
              "
            />

            {/* CTA Slide Shine */}
            <div
              className="
                absolute inset-0 bg-gradient-to-r
                from-white/30 to-transparent
                opacity-0 group-hover/btn:opacity-100
                transition-opacity duration-500
              "
            />
          </button>
        </Link>
      </div>

      {/* Decorative glass orbs */}
      <div
        className="
          absolute -top-6 -right-6 w-20 h-20
          bg-white/10 backdrop-blur-xl
          rounded-full opacity-20
          transition-all duration-700
          group-hover:opacity-40 group-hover:scale-125
        "
      />
      <div
        className="
          absolute bottom-4 right-6 w-8 h-8
          bg-white/10 backdrop-blur-xl
          rounded-full opacity-30
          transition-all duration-700
          group-hover:opacity-60 group-hover:scale-110
        "
      />
    </section>
  );
}
