"use client";

import {
  MdOutlineKeyboardArrowLeft,
  MdOutlineKeyboardArrowRight,
} from "react-icons/md";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState } from "react";
import RecentViewedCard from "@omenai/shared-ui-components/components/artworks/RecentViewedCard";
import { MdHistory } from "react-icons/md";

export default function RecentViewArtworks({ artworks }: { artworks: any }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    dragFree: true,
  });

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const onSelect = useCallback((api: any) => {
    setCanScrollPrev(api.canScrollPrev());
    setCanScrollNext(api.canScrollNext());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect(emblaApi);
    emblaApi.on("reInit", onSelect);
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("reInit", onSelect);
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  if (!artworks || artworks.length === 0) return null;

  return (
    <section className="w-full bg-[#FAFAFA] py-12 md:py-16 border-t border-neutral-200">
      <div className="container mx-auto px-4">
        {/* 1. HEADER: Utility Style (Smaller, Functional) */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <MdHistory className="text-dark  text-xl" />
            <h2 className="text-xl md:text-2xl font-serif text-dark ">
              Recently Viewed
            </h2>
          </div>

          {/* Controls */}
          <div className="flex gap-2">
            <button
              onClick={scrollPrev}
              disabled={!canScrollPrev}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-300 bg-white text-dark  hover:bg-[#091830] hover:text-white disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-dark  transition-colors"
            >
              <MdOutlineKeyboardArrowLeft className="text-lg" />
            </button>
            <button
              onClick={scrollNext}
              disabled={!canScrollNext}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-300 bg-white text-dark  hover:bg-[#091830] hover:text-white disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-dark  transition-colors"
            >
              <MdOutlineKeyboardArrowRight className="text-lg" />
            </button>
          </div>
        </div>

        {/* 2. CAROUSEL */}
        <div className="embla overflow-hidden" ref={emblaRef}>
          <div className="embla__container flex gap-4 md:gap-6">
            {artworks.map((artwork: any, index: number) => {
              return (
                <div
                  className="embla__slide min-w-0 flex-[0_0_auto]"
                  key={index + artwork.art_id}
                >
                  {/* Compact Card Width */}
                  <div className="w-[200px] md:w-[240px]">
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
      </div>
    </section>
  );
}
