"use client";

/**
 * PromotionalCard — Luxury Art Gallery Edition
 *
 * Font setup (add to your layout.tsx or globals.css):
 *   import { Cormorant_Garamond, DM_Sans } from 'next/font/google'
 * Or in globals.css:
 *   @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400&family=DM+Sans:opsz,wght@9..40,300;400&display=swap');
 */

import { getPromotionalOptimizedImage } from "@omenai/shared-lib/storage/getPromotionalsFileView";
import { PromotionalSchemaTypes } from "@omenai/shared-types";
import Image from "next/image";
import Link from "next/link";

// Warm gallery parchment — used for the card bg and the gradient bleed target
const PARCHMENT = "#ffffff";

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
      className="group relative flex w-full flex-col items-center justify-center overflow-hidden md:h-[420px] md:flex-row"
      style={{ backgroundColor: "transparent" }}
    >
      {/* ══════════════════════════════════════════
          IMAGE PANEL
          Mobile  → full-width, aspect-[4/3], no padding, object-cover
          Desktop → fills h-[420px] parent, 60% width, object-contain (artwork safe)
         ══════════════════════════════════════════ */}
      <div className="relative w-full overflow-hidden md:p-6 aspect-[4/3] md:aspect-auto md:h-full md:w-[60%]">
        {/* Ambient blur — bleeds colour edge-to-edge behind the artwork */}
        <div className="absolute inset-0 z-0">
          <Image
            src={image_url}
            alt=""
            fill
            className="scale-125 object-cover blur-3xl opacity-30 saturate-50 transition-opacity duration-700 group-hover:opacity-45"
            aria-hidden="true"
            priority={false}
          />
        </div>

        {/* Main artwork image */}
        <div className="relative z-10 h-full w-full">
          <Image
            src={image_url}
            alt={headline}
            fill
            // Mobile: cover fills edge-to-edge. Desktop: contain preserves artwork proportions.
            className="object-cover object-top md:object-contain  transition-transform duration-1000 ease-out group-hover:scale-[1.025]"
            sizes="(max-width: 768px) 100vw, 60vw"
            priority
          />
        </div>

        {/* Gradient bleed — image fades seamlessly into the text panel below (mobile only) */}
        <div
          className="absolute bottom-0 left-0 right-0 z-20 h-24 md:hidden"
          style={{}}
        />
      </div>

      {/* ══════════════════════════════════════════
          TEXT PANEL
         ══════════════════════════════════════════ */}
      <div className="relative flex w-full flex-col justify-center px-7 pb-10 pt-3 md:h-full md:w-[40%] md:px-12 lg:px-16">
        {/* Thin vertical divider separating panels on desktop */}
        <div className="absolute left-0 top-1/2 hidden h-20 w-px -translate-y-1/2 bg-stone-300/70 md:block" />

        {/* ── Meta row ── */}
        <div className="mb-5 flex items-center gap-3">
          <span
            className="block h-px bg-stone-400 transition-[width] duration-500 ease-out group-hover:w-14"
            style={{ width: "2rem" }}
          />
          <span
            className="text-[9px] font-medium uppercase text-stone-400"
            style={{
              fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
              letterSpacing: "0.28em",
            }}
          >
            Featured
          </span>
        </div>

        {/* ── Headline — Cormorant Garamond, light weight ── */}
        <h2
          className="mb-4 leading-[1.04] text-stone-900"
          style={{
            fontFamily: "'Cormorant Garamond', 'Cormorant', Georgia, serif",
            fontWeight: 300,
            fontSize: "clamp(1.9rem, 3.5vw, 2.65rem)",
            letterSpacing: "-0.015em",
          }}
        >
          {headline}
        </h2>

        {/* ── Subheadline ── */}
        <p
          className="mb-8 line-clamp-3 max-w-xs leading-relaxed text-stone-500"
          style={{
            fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
            fontWeight: 300,
            fontSize: "0.8rem",
            letterSpacing: "0.01em",
          }}
        >
          {subheadline}
        </p>

        {/* ── CTA ── */}
        <div className="flex items-center gap-3 text-stone-900">
          <span
            className="relative pb-[2px] text-[10px] font-medium uppercase"
            style={{
              fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
              letterSpacing: "0.24em",
            }}
          >
            Discover
            {/* Animated underline */}
            <span className="absolute bottom-0 left-0 block h-px w-0 bg-stone-800 transition-[width] duration-500 ease-out group-hover:w-full" />
          </span>

          {/* Minimal custom arrow — more refined than icon libraries */}
          <svg
            width="30"
            height="9"
            viewBox="0 0 30 9"
            fill="none"
            className="translate-y-[0.5px] transition-transform duration-500 ease-out group-hover:translate-x-2"
            aria-hidden="true"
          >
            <line
              x1="0"
              y1="4.5"
              x2="26.5"
              y2="4.5"
              stroke="currentColor"
              strokeWidth="0.75"
            />
            <polyline
              points="22.5,1 26.5,4.5 22.5,8"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.75"
            />
          </svg>
        </div>

        {/* ── Corner bracket — subtle decorative element, desktop only ── */}
        <div className="absolute bottom-5 right-5 hidden opacity-[0.18] md:block">
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            aria-hidden="true"
          >
            <path d="M20 0 L20 20 L0 20" stroke="#78716c" strokeWidth="0.75" />
          </svg>
        </div>
      </div>
    </Link>
  );
}
