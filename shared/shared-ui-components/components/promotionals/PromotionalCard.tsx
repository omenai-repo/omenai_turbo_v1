"use client";

import { getPromotionalOptimizedImage } from "@omenai/shared-lib/storage/getPromotionalsFileView";
import { PromotionalSchemaTypes } from "@omenai/shared-types";
import Image from "next/image";
import Link from "next/link";
import { MdArrowRightAlt } from "react-icons/md";

export default function PromotionalCard({
  headline,
  subheadline,
  cta,
  image,
}: PromotionalSchemaTypes) {
  const image_url = getPromotionalOptimizedImage(image, "large", 1000);

  return (
    <Link
      href={cta}
      //Kept the shorter desktop height from previous iteration
      className="group flex h-[500px] w-full flex-col overflow-hidden border border-neutral-100 bg-[#FCFCFA] md:h-[460px] md:flex-row"
    >
      {/* 1. THE ARTWORK SECTION */}
      {/* Added relative and overflow-hidden to contain the blurred background */}
      <div className="relative flex h-[55%] w-full items-center justify-center overflow-hidden p-8 md:h-full md:w-[60%] md:p-10 lg:p-12">
        {/* --- NEW: Blurred Ambient Background --- */}
        {/* Sits behind the main image (z-0). Low opacity and slight desaturation keep it elegant. */}
        <div className="absolute inset-0 z-0">
          <Image
            src={image_url}
            alt=""
            fill
            className="scale-125 object-cover blur-2xl opacity-25 saturate-75 transition-opacity duration-700 group-hover:opacity-40"
            aria-hidden="true"
          />
          {/* Optional: A very light white overlay to ensure it remains high-key and bright */}
          <div className="absolute inset-0 bg-white/30 mix-blend-overlay" />
        </div>
        {/* --------------------------------------- */}

        {/* --- Foreground Main Image --- */}
        {/* Added z-10 to ensure it sits on top of the blur */}
        <div className="relative z-10 h-full w-full">
          <Image
            src={image_url}
            alt={headline}
            fill
            className="object-contain drop-shadow-[0_15px_35px_rgba(0,0,0,0.15)] transition-transform duration-1000 ease-out group-hover:scale-[1.02]"
            sizes="(max-width: 768px) 100vw, 60vw"
          />
        </div>
      </div>

      {/* 2. THE TYPOGRAPHY SECTION (Placard) */}
      {/* Kept exactly the same as the previous atelier version */}
      <div className="flex h-[45%] w-full flex-col justify-center bg-accentLight p-8 md:h-full md:w-[40%] md:px-12 lg:px-16 z-20">
        <div className="flex flex-col items-start gap-5">
          {/* Subtle Metadata */}
          <div className="flex items-center gap-4 text-neutral-400">
            <span className="h-[1px] w-8 bg-neutral-300 transition-all duration-500 group-hover:w-12" />
            <span className="text-[10px] font-medium uppercase tracking-[0.2em]">
              Featured
            </span>
          </div>

          {/* High-End Typography */}
          <div className="space-y-3">
            <h2 className="font-serif text-3xl font-normal leading-[1.1] tracking-tight text-neutral-900 lg:text-4xl">
              {headline}
            </h2>
            <p className="line-clamp-3 max-w-sm font-sans text-sm font-light leading-relaxed text-neutral-500">
              {subheadline}
            </p>
          </div>

          {/* Minimalist CTA */}
          <div className="mt-2 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.15em] text-neutral-900">
            <span className="relative pb-1">
              Discover
              <span className="absolute bottom-0 left-0 h-[1px] w-0 bg-neutral-900 transition-all duration-500 group-hover:w-full" />
            </span>
            <MdArrowRightAlt className="text-lg transition-transform duration-500 group-hover:translate-x-2" />
          </div>
        </div>
      </div>
    </Link>
  );
}
