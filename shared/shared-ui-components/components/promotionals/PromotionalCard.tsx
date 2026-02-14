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
      className="group block h-full w-full cursor-pointer relative overflow-hidden rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
    >
      <article className="flex flex-col md:flex-row h-[420px] w-full bg-[#091830]">
        {/* 1. IMAGE SECTION (Top on Mobile, Left on Desktop) */}
        {/* On Desktop, this takes 60% width. The narrower width helps the image fill the space better. */}
        <div className="relative h-full w-full md:w-[60%] bg-[#0F2342] overflow-hidden">
          {/* Blurred Background (Atmosphere) */}
          <div className="absolute inset-0 z-0">
            <Image
              src={image_url}
              alt=""
              fill
              className="object-cover opacity-60 blur-xl scale-110"
              aria-hidden="true"
            />
            {/* Overlay to unify the color tone */}
            <div className="absolute inset-0 bg-[#091830]/20 mix-blend-multiply" />
          </div>

          {/* Foreground Image (The Artwork) */}
          <div className="absolute inset-0 z-10 p-6 md:p-12 flex items-center justify-center">
            <div className="relative h-full w-full">
              <Image
                src={image_url}
                alt={headline}
                fill
                className="object-contain drop-shadow-2xl transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                sizes="(max-width: 768px) 100vw, 60vw"
              />
            </div>
          </div>

          {/* Mobile-Only Gradient (To make text readable on mobile) */}
          <div className="md:hidden absolute inset-0 z-20 bg-gradient-to-t from-[#091830] via-[#091830]/40 to-transparent" />
        </div>

        {/* 2. CONTENT SECTION (Overlay on Mobile, Side Panel on Desktop) */}
        <div
          className="
            absolute bottom-0 left-0 z-30 w-full p-8 
            md:relative md:w-[40%] md:h-full md:p-12 md:bg-[#091830] md:flex md:flex-col md:justify-center md:items-start
        "
        >
          <div className="flex flex-col gap-4 md:gap-6">
            {/* Badge */}
            <div>
              <span className="inline-block rounded bg-white/10 px-3 py-1 font-sans text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-md border border-white/10">
                Featured Item
              </span>
            </div>

            {/* Typography */}
            <div>
              <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-white leading-[1.1] mb-3 md:mb-4 drop-shadow-md md:drop-shadow-none">
                {headline}
              </h2>
              <p className="font-sans text-sm text-neutral-300 leading-relaxed line-clamp-2 md:line-clamp-4 max-w-md drop-shadow-sm md:drop-shadow-none">
                {subheadline}
              </p>
            </div>

            {/* CTA Button */}
            <div className="mt-2 md:mt-4">
              <span
                className="
                      inline-flex items-center gap-3 
                      font-sans text-xs font-bold uppercase tracking-wide text-white
                      group-hover:text-white/80 transition-colors
                    "
              >
                Explore
                <span className="bg-white text-dark  rounded-full p-1 transition-transform duration-300 group-hover:translate-x-1">
                  <MdArrowRightAlt className="text-lg" />
                </span>
              </span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
