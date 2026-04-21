"use client";

import {
  MdOutlineKeyboardArrowLeft,
  MdOutlineKeyboardArrowRight,
  MdHistory,
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
    <section className="w-full">
      <div className="w-full">
        {/* 1. HEADER: Utility Style (Smaller, Functional) */}
        <div className="flex items-center gap-3 mb-6">
          <MdHistory className="text-dark text-xl" />
          <h2 className="text-3xl font-serif text-dark">Recently Viewed</h2>
        </div>

        {/* 2. CAROUSEL WRAPPER */}
        {/* Added a relative wrapper here to contain the absolutely positioned buttons */}
        <div className="relative group">
          {/* Previous Button (Left Side) */}
          <button
            onClick={scrollPrev}
            disabled={!canScrollPrev}
            className="absolute left-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-neutral-200 bg-white shadow-md text-dark hover:bg-[#091830] hover:text-white disabled:opacity-0 disabled:pointer-events-none transition-all duration-300"
            aria-label="Previous slide"
          >
            <MdOutlineKeyboardArrowLeft className="text-xl" />
          </button>

          {/* Embla Container */}
          <div className="embla overflow-hidden" ref={emblaRef}>
            <div className="embla__container flex">
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

          {/* Next Button (Right Side) */}
          <button
            onClick={scrollNext}
            disabled={!canScrollNext}
            className="absolute right-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-neutral-200 bg-white shadow-md text-dark hover:bg-[#091830] hover:text-white disabled:opacity-0 disabled:pointer-events-none transition-all duration-300"
            aria-label="Next slide"
          >
            <MdOutlineKeyboardArrowRight className="text-xl" />
          </button>
        </div>
      </div>
    </section>
  );
}
