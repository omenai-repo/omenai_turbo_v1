"use client";

import {
  MdOutlineKeyboardArrowLeft,
  MdOutlineKeyboardArrowRight,
} from "react-icons/md";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState } from "react";
import RecentViewedCard from "@omenai/shared-ui-components/components/artworks/RecentViewedCard";

export default function RecentViewArtworks({ artworks }: { artworks: any }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    dragFree: true,
  });

  const [scrollProgress, setScrollProgress] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  // Sync Progress
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

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  if (!artworks || artworks.length === 0) return null;

  return (
    <section className="w-full bg-neutral-50 py-20 border-t border-neutral-200">
      <div className="container mx-auto">
        {/* 1. HEADER: Minimalist Split */}
        <div className="mb-12 flex flex-col py-6 items-start justify-between gap-6 md:flex-row md:items-end">
          <div>
            <span className="mb-4 block font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-400">
              Session History
            </span>
            <h2 className="text-5xl md:text-6xl font-serif text-neutral-900 md:text-5xl">
              Collector’s{" "}
              <span className="italic text-neutral-500">Trace.</span>
            </h2>
          </div>

          <div className="flex max-w-xs flex-col items-start gap-1 text-right md:items-end">
            <p className="font-sans text-xs text-neutral-500">
              Visual artifacts from your journey.
            </p>
          </div>
        </div>

        {/* 2. TIMELINE CAROUSEL */}
        <div className="embla overflow-hidden" ref={emblaRef}>
          <div className="embla__container flex gap-6 md:gap-8">
            {artworks.map((artwork: any, index: number) => {
              return (
                <div
                  className="embla__slide min-w-0 flex-[0_0_auto]"
                  key={index + artwork.art_id}
                >
                  {/* Smaller Card Width for "History" feel (260px - 300px) */}
                  <div className="w-[260px] md:w-[300px]">
                    <RecentViewedCard
                      image={artwork.url}
                      artist={artwork.artist}
                      name={artwork.artwork}
                      art_id={artwork.art_id}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. CONTROLS (Bottom Aligned) */}
        <div className="mt-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          {/* Progress Line */}
          <div className="relative h-[1px] w-full bg-neutral-200 md:max-w-xs">
            <div
              className="absolute top-0 left-0 h-full bg-dark transition-all duration-300"
              style={{ width: `${scrollProgress * 100}%` }}
            />
          </div>

          {/* Square Buttons */}
          <div className="flex gap-4">
            <button
              onClick={scrollPrev}
              disabled={!canScrollPrev}
              className="flex h-10 w-10 items-center justify-center border border-neutral-300 bg-transparent text-neutral-900 transition-all hover:border-black hover:bg-dark hover:text-white disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-neutral-900 disabled:hover:border-neutral-300"
            >
              <MdOutlineKeyboardArrowLeft className="text-xl" />
            </button>
            <button
              onClick={scrollNext}
              disabled={!canScrollNext}
              className="flex h-10 w-10 items-center justify-center border border-neutral-300 bg-transparent text-neutral-900 transition-all hover:border-black hover:bg-dark hover:text-white disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-neutral-900 disabled:hover:border-neutral-300"
            >
              <MdOutlineKeyboardArrowRight className="text-xl" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
