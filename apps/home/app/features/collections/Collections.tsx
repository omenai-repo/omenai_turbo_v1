"use client";
import React, { useCallback, useEffect, useState } from "react";
import ArtCollectionCard from "./ArtCollectionCard";
import {
  MdOutlineKeyboardArrowLeft,
  MdOutlineKeyboardArrowRight,
} from "react-icons/md";
import useEmblaCarousel from "embla-carousel-react";
import { collections } from "../../collectionConstants";

export default function Collections({
  isCatalog = false,
}: {
  isCatalog?: boolean;
}) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: "start",
    containScroll: "trimSnaps",
    dragFree: true,
  });

  const [scrollProgress, setScrollProgress] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  // Sync Progress & Button States
  const onScroll = useCallback((api: any) => {
    const progress = Math.max(0, Math.min(1, api.scrollProgress()));
    setScrollProgress(progress);
    setCanScrollPrev(api.canScrollPrev());
    setCanScrollNext(api.canScrollNext());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    onScroll(emblaApi);
    emblaApi.on("reInit", onScroll);
    emblaApi.on("scroll", onScroll);
    emblaApi.on("resize", onScroll);
    return () => {
      emblaApi.off("reInit", onScroll);
      emblaApi.off("scroll", onScroll);
      emblaApi.off("resize", onScroll);
    };
  }, [emblaApi, onScroll]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  // CATALOG MODE (Simple Header)
  if (isCatalog) {
    return (
      <div className="w-full bg-white">
        <div className="container mx-auto px-6 lg:px-12 py-12">
          <div className="flex items-baseline gap-4 border-b border-black pb-6">
            <h1 className="font-serif text-5xl italic text-dark">
              Collections
            </h1>
            <span className="font-mono text-xs uppercase tracking-widest text-neutral-400">
              / Full Archive
            </span>
          </div>
        </div>
      </div>
    );
  }

  // SERIES MODE (Homepage)
  return (
    <section className="w-full bg-[#FAFAFA] py-8 md:py-24 border-t border-neutral-200">
      <div className="container mx-auto px-6 lg:px-12">
        {/* 1. ARCHITECTURAL HEADER (Split Layout) */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 mb-20">
          {/* LEFT: Title */}
          <div className="max-w-4xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-1.5 w-1.5 bg-dark"></div> {/* Anchor Dot */}
              <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-neutral-500">
                Curated Series
              </span>
            </div>

            <h2 className="text-5xl md:text-6xl font-serif text-neutral-900 leading-[0.9]">
              Anthologies of <br />
              <span className="italic text-neutral-400">Modern Vision.</span>
            </h2>
          </div>

          {/* RIGHT: Editorial Context */}
          <div className="max-w-xs flex flex-col gap-6 items-start md:items-end text-left md:text-right">
            <p className="font-sans text-xs leading-relaxed text-neutral-500">
              Art is not solitary; it exists in conversation. We have assembled
              distinct collections that trace the invisible threads connecting
              style, movement, and emotion.
            </p>
          </div>
        </div>

        {/* 2. CAROUSEL */}
        <div className="embla overflow-hidden" ref={emblaRef}>
          <div className="embla__container flex gap-6 md:gap-8">
            {collections.map((collection) => (
              <div key={collection.title} className="flex-[0_0_auto]">
                {/* Ensure your ArtCollectionCard has a fixed width or 
                   wrap it here to control the cadence.
                   Example: w-[300px] md:w-[400px]
                */}
                <div className="w-[300px] md:w-[380px]">
                  <ArtCollectionCard
                    isCatalog={isCatalog}
                    title={collection.title}
                    url={collection.url}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. CONTROL BAR (Bottom Aligned) */}
        <div className="mt-12 pt-6 border-t border-neutral-200 flex flex-col md:flex-row md:items-center justify-between gap-8">
          {/* Timeline */}
          <div className="relative h-[2px] w-full bg-neutral-200 md:max-w-md">
            <div
              className="absolute top-0 left-0 h-full bg-dark transition-all duration-300 ease-out"
              style={{ width: `${scrollProgress * 100}%` }}
            />
          </div>

          {/* Buttons: STRICT SQUARES */}
          <div className="flex gap-4">
            <button
              onClick={scrollPrev}
              disabled={!canScrollPrev}
              className="flex h-12 w-12 items-center justify-center border border-neutral-200 bg-white text-neutral-900 transition-all hover:border-black hover:bg-dark hover:text-white disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-neutral-900 rounded-none"
            >
              <MdOutlineKeyboardArrowLeft className="text-xl" />
            </button>
            <button
              onClick={scrollNext}
              disabled={!canScrollNext}
              className="flex h-12 w-12 items-center justify-center border border-neutral-200 bg-white text-neutral-900 transition-all hover:border-black hover:bg-dark hover:text-white disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-neutral-900 rounded-none"
            >
              <MdOutlineKeyboardArrowRight className="text-xl" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
