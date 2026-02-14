"use client";

import {
  getPromotionalFileView,
  getPromotionalOptimizedImage,
} from "@omenai/shared-lib/storage/getPromotionalsFileView";
import { PromotionalSchemaTypes } from "@omenai/shared-types";
import Image from "next/image";
import Link from "next/link";
import { MdArrowRightAlt } from "react-icons/md"; // Switched to MdArrow for consistency

export default function PromotionalCard({
  headline,
  subheadline,
  cta,
  image,
}: PromotionalSchemaTypes) {
  // High-res request for the hero slot
  const image_url = getPromotionalOptimizedImage(image, "large", 1000);

  return (
    <Link
      href={cta}
      className="group block h-full w-full cursor-pointer relative"
    >
      <article className="relative h-[65vh] min-h-[550px] w-full overflow-hidden bg-neutral-900">
        {/* 1. IMAGE LAYER */}
        <div className="absolute inset-0 z-0">
          <Image
            src={image_url}
            alt={headline}
            fill
            priority
            className="object-cover object-top transition-transform duration-[2s] ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 80vw"
          />
          {/* Noise/Grain Overlay (Kept as it adds texture) */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.04] mix-blend-overlay"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")`,
            }}
          />
        </div>

        {/* 2. GRADIENT OVERLAY - Sharper, more dramatic fade */}
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90 transition-opacity duration-700 group-hover:opacity-80" />

        {/* 3. TOP BADGE (The "Catalog" Stamp) */}
        <div className="absolute left-6 top-6 z-20 md:left-10 md:top-10">
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2 border border-white/20">
            <div className="h-1.5 w-1.5 bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]"></div>
            <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-white">
              Featured Selection
            </span>
          </div>
        </div>

        {/* 4. CONTENT LAYER */}
        <div className="absolute bottom-0 left-0 z-20 flex w-full flex-col justify-end p-6 md:p-12">
          <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            {/* Typography */}
            <div className="max-w-3xl transform transition-transform duration-700 group-hover:-translate-y-2">
              <h2 className="font-serif text-4xl font-light italic leading-[1.05] tracking-tight text-white md:text-5xl lg:text-6xl">
                {headline}
              </h2>

              <div className="mt-6 flex items-start gap-4">
                <div className="mt-1.5 h-[1px] w-8 bg-white/50"></div>
                <p className="max-w-lg font-sans text-sm leading-relaxed text-white/90 md:text-base">
                  {subheadline}
                </p>
              </div>
            </div>

            {/* CTA Button - Inverts on Hover */}
            <div className="md:mb-2">
              <span
                className="
                  inline-flex items-center gap-4 
                  border border-white bg-white px-8 py-4 
                  font-mono text-xs font-bold uppercase tracking-[0.2em] text-dark 
                  transition-all duration-300 
                  group-hover:bg-dark group-hover:text-white group-hover:border-black
                "
              >
                View Exhibit
                <MdArrowRightAlt className="text-xl transition-transform duration-300 group-hover:translate-x-2" />
              </span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
