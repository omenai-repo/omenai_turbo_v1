"use client";
import { getPromotionalFileView } from "@omenai/shared-lib/storage/getPromotionalsFileView";
import { PromotionalSchemaTypes } from "@omenai/shared-types";
import Image from "next/image";
import Link from "next/link";
import { IoIosArrowRoundForward } from "react-icons/io";

import { ObjectId } from "mongoose";

export default function PromotionalCard({
  headline,
  subheadline,
  cta,
  image,
}: PromotionalSchemaTypes) {
  const image_url = getPromotionalFileView(image, 400, 200);

  return (
    <section className="group relative min-w-[200px] w-[300px] sm:w-[400px] sm:max-w-[400px] h-[200px] rounded-lg overflow-hidden shadow-2xl transform transition-all duration-500 hover:scale-101 hover:shadow-3xl">
      {/* Gradient overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent z-10" />

      {/* Background image with parallax effect */}
      <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-110">
        <Image
          width={400}
          height={200}
          className="w-full h-full object-cover rounded-lg"
          src={image_url}
          alt={`hero image ${headline}`}
          priority
        />
      </div>

      {/* Content overlay */}
      <div className="relative z-20 flex h-full items-center justify-between p-4">
        {/* Text content */}
        <div className="flex flex-col justify-center space-y-2 text-white max-w-[80%]">
          <div className="space-y-2">
            <h3 className="text-fluid-base font-medium  leading-tight tracking-wide transform transition-all duration-300 group-hover:translate-x-1">
              {headline}
            </h3>
            <p className="text-[13px] font-normal text-white leading-relaxed opacity-90 transform transition-all duration-300 group-hover:translate-x-1">
              {subheadline}
            </p>
          </div>

          {/* CTA Button */}
          <Link href={cta} className="inline-block">
            <button className="group/btn relative flex items-center gap-x-2 bg-white/10 backdrop-blur-sm text-white px-4 py-1.5  text-fluid-xxs rounded border border-white/20 transition-all duration-300 hover:bg-white hover:text-black hover:border-white hover:shadow-lg transform hover:scale-105 active:scale-95">
              <span className="font-normal text-fluid-xxs">Explore</span>
              <IoIosArrowRoundForward className="transition-transform duration-300 group-hover/btn:translate-x-1" />

              {/* Button glow effect */}
              <div className="absolute inset-0 rounded bg-gradient-to-r from-white/20 to-transparent opacity-0 transition-opacity duration-300 group-hover/btn:opacity-100" />
            </button>
          </Link>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-4 right-4 w-16 h-16 rounded bg-white/10 backdrop-blur-sm opacity-20 transition-all duration-500 group-hover:opacity-40 group-hover:scale-110" />
        <div className="absolute bottom-4 right-8 w-8 h-8 rounded bg-white/5 backdrop-blur-sm opacity-30 transition-all duration-700 group-hover:opacity-60" />
      </div>

      {/* Subtle border glow */}
      <div className="absolute inset-0 rounded ring-1 ring-white/10 pointer-events-none transition-all duration-300 group-hover:ring-white/20" />
    </section>
  );
}
