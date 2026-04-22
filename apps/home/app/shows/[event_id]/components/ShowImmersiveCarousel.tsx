"use client";

import React, { useEffect, useCallback, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { getOptimizedImage } from "@omenai/shared-lib/storage/getImageFileView";
import { formatPrice } from "@omenai/shared-utils/src/priceFormatter";

interface ShowImmersiveCarouselProps {
  show: any;
  onClose: () => void;
}

export const ShowImmersiveCarousel = ({
  show,
  onClose,
}: ShowImmersiveCarouselProps) => {
  const artworks = show.artworks;

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", () =>
      setSelectedIndex(emblaApi.selectedScrollSnap()),
    );
  }, [emblaApi]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") scrollPrev();
      if (e.key === "ArrowRight") scrollNext();
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [scrollPrev, scrollNext, onClose]);

  const currentArt = artworks[selectedIndex];

  return (
    <section className="w-full bg-white border-t border-b border-black">
      {/* ── Header bar ── */}
      <div className="flex items-center justify-between px-8 md:px-14 lg:px-20 py-4 border-b border-neutral-100">
        <div className="flex items-center gap-4">
          <span className="text-[10px] uppercase tracking-[0.25em] font-medium font-sans text-neutral-500">
            {show.gallery.name}
          </span>
          <span className="w-px h-3 bg-neutral-200 inline-block" />
          <span className="text-[10px] uppercase tracking-[0.2em] font-semibold font-sans text-black">
            {show.title}
          </span>
        </div>
        <button
          onClick={onClose}
          className="group flex items-center gap-2.5 text-[10px] uppercase tracking-[0.25em] font-medium font-sans text-neutral-400 hover:text-black transition-colors duration-200"
        >
          <span className="w-5 h-px bg-current transition-all duration-200 group-hover:w-7" />
          Exit Immersive
        </button>
      </div>

      {/* ── Carousel ── */}
      <div className="relative overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {artworks.map((art: any) => (
            <div key={art.art_id} className="flex-[0_0_100%] min-w-0">
              <div className="flex items-center justify-center w-full h-[80vh] bg-white px-8 md:px-24 lg:px-40 py-10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getOptimizedImage(art.url, "xlarge")}
                  alt={art.title}
                  className="max-h-full max-w-full object-contain"
                  style={{ maxHeight: "68vh" }}
                  draggable={false}
                />
              </div>
            </div>
          ))}
        </div>

        {/* ── Prev / Next arrows ── */}
        <button
          onClick={scrollPrev}
          aria-label="Previous artwork"
          className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-10 w-10 h-10 border border-neutral-300 bg-white hover:border-black hover:bg-black group flex items-center justify-center transition-all duration-150"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            className="text-neutral-500 group-hover:text-white transition-colors"
          >
            <path
              d="M9 2L4 7L9 12"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <button
          onClick={scrollNext}
          aria-label="Next artwork"
          className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-10 w-10 h-10 border border-neutral-300 bg-white hover:border-black hover:bg-black group flex items-center justify-center transition-all duration-150"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            className="text-neutral-500 group-hover:text-white transition-colors"
          >
            <path
              d="M5 2L10 7L5 12"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {/* ── Artwork info + counter ── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 px-8 md:px-14 lg:px-20 py-6 border-t border-neutral-100">
        {/* Artwork metadata */}
        <div className="flex flex-col gap-1.5">
          <p className="font-serif text-xl font-light text-black leading-tight">
            {currentArt?.title}
          </p>
          <p className="text-[12px] font-sans text-neutral-600">
            {currentArt?.artist}
          </p>
          {currentArt?.medium && (
            <p className="text-[10px] uppercase tracking-[0.15em] font-medium font-sans text-neutral-400 mt-0.5">
              {currentArt.medium}
            </p>
          )}
          {currentArt?.availability && (
            <span
              className={`mt-1 inline-block w-fit text-[10px] uppercase tracking-[0.15em] font-medium font-sans px-2.5 py-1 border ${
                currentArt.availability
                  ? "border-black text-black"
                  : "border-neutral-300 text-neutral-500"
              }`}
            >
              {currentArt.availability
                ? formatPrice(currentArt.pricing.usd_price)
                : "Sold"}
            </span>
          )}
        </div>

        {/* Counter */}
        <div className="flex items-center gap-1.5 font-sans text-[11px] tracking-[0.15em] text-neutral-400 shrink-0 pt-1">
          <span className="text-black font-medium">{selectedIndex + 1}</span>
          <span>/</span>
          <span>{artworks.length}</span>
        </div>
      </div>

      {/* ── Dot / line indicators ── */}
      <div className="flex justify-center items-center gap-1.5 pb-8">
        {artworks.map((_: any, i: number) => (
          <button
            key={i}
            onClick={() => emblaApi?.scrollTo(i)}
            aria-label={`Go to artwork ${i + 1}`}
            className="h-px transition-all duration-300"
            style={{
              width: i === selectedIndex ? "2rem" : "0.75rem",
              backgroundColor: i === selectedIndex ? "#000" : "#d1d5db",
            }}
          />
        ))}
      </div>
    </section>
  );
};
