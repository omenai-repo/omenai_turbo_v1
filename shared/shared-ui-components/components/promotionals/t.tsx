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
      // Warm, pristine off-white background typical of art galleries
      className="group flex h-[400px] w-full flex-col overflow-hidden bg-[#FCFCFA] md:h-[400px] md:flex-row border border-neutral-100"
    >
      {/* 1. THE ARTWORK (The "Wall") */}
      {/* We give the art generous padding so any aspect ratio acts as a focal point surrounded by negative space */}
      <div className="relative flex h-[45%] w-full items-center justify-center bg-[#F5F5F2] p-8 transition-colors duration-700 group-hover:bg-[#EFEFEA] md:h-full md:w-[60%] md:p-20">
        <div className="relative h-full w-full">
          <Image
            src={image_url}
            alt={headline}
            fill
            // object-contain handles all aspect ratios naturally
            // The shadow mimics a physical canvas hanging on a wall
            className="object-contain drop-shadow-[0_15px_35px_rgba(0,0,0,0.15)] transition-transform duration-1000 ease-out group-hover:scale-[1.02]"
            sizes="(max-width: 768px) 100vw, 60vw"
          />
        </div>
      </div>

      {/* 2. THE PLACARD (The Typography) */}
      <div className="flex h-[35%] w-full flex-col justify-center p-8 md:h-full md:w-[30%]">
        <div className="flex flex-col items-start gap-6">
          {/* Subtle Metadata */}
          <div className="flex items-center gap-4 text-neutral-400">
            <span className="h-[1px] w-8 bg-neutral-300 transition-all duration-500 group-hover:w-12" />
            <span className="text-[10px] font-medium uppercase tracking-[0.2em]">
              Exhibition
            </span>
          </div>

          {/* High-End Typography */}
          <div className="space-y-4">
            <h2 className="font -serif text-3xl font-normal leading-[1.1] tracking-tight text-neutral-900 md:text-4xl lg:text-5xl">
              {headline}
            </h2>
            <p className="line-clamp-3 max-w-sm font-sans text-sm font-normal leading-relaxed text-neutral-500 md:text-base md:leading-loose">
              {subheadline}
            </p>
          </div>

          {/* Minimalist CTA */}
          <div className="mt-4 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.15em] text-neutral-900">
            <span className="relative pb-1">
              Discover
              {/* Elegant animated underline */}
              <span className="absolute bottom-0 left-0 h-[1px] w-0 bg-neutral-900 transition-all duration-500 group-hover:w-full" />
            </span>
            <MdArrowRightAlt className="text-lg transition-transform duration-500 group-hover:translate-x-2" />
          </div>
        </div>
      </div>
    </Link>
  );
}
