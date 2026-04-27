"use client";

import React, { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ArtworkSchemaTypes } from "@omenai/shared-types";
import ArtworkCard from "@omenai/shared-ui-components/components/artworks/ArtworkCard";
import TrendingArtworkCard from "./TrendingArtCard";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function TrendingArtworks({
  artworks,
  sessionId,
}: {
  artworks: any;
  sessionId: string | undefined;
}) {
  // Initialize Embla with drag-free scrolling and strict snap boundaries
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    dragFree: true,
  });

  const [prevBtnDisabled, setPrevBtnDisabled] = useState(true);
  const [nextBtnDisabled, setNextBtnDisabled] = useState(true);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setPrevBtnDisabled(!emblaApi.canScrollPrev());
    setNextBtnDisabled(!emblaApi.canScrollNext());
  }, [emblaApi]);

  // Sync button states with carousel position
  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("reInit", onSelect);
    emblaApi.on("select", onSelect);
  }, [emblaApi, onSelect]);

  if (!artworks || artworks.length === 0) return null;

  return (
    <div className="relative w-full group">
      {/* Embla Viewport (Overflow hidden handles the clipping) */}
      <div className="overflow-hidden px-1" ref={emblaRef}>
        {/* Embla Container (Track) */}
        <div className="flex gap-5 items-end pb-4">
          {artworks.map((art: ArtworkSchemaTypes) => (
            // Embla Slides: Fixed width, shrink-0 ensures they don't crush together
            <div key={art.art_id} className="flex-[0_0_200px] min-w-0">
              <TrendingArtworkCard
                key={art.art_id}
                image={art.url}
                name={art.title}
                artist={art.artist}
                impressions={art.impressions as number}
                medium={art.medium}
                rarity={art.rarity}
                likeIds={art.like_IDs as string[]}
                sessionId={sessionId}
                art_id={art.art_id}
                availability={art.availability}
              />
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={scrollPrev}
        className="absolute left-6 top-[35%] -translate-y-1/2 w-12 h-12 bg-[#FAF8F5] border border-[#E8E4DF] rounded-full shadow-[0_8px_30px_rgba(28,25,23,0.12)] flex items-center justify-center z-10 text-[#1C1917] transition-all hover:bg-[#1C1917] hover:text-[#FAF8F5] opacity-0 group-hover:opacity-100"
        aria-label="Previous slide"
      >
        <ChevronLeft size={32} strokeWidth={1.5} className="ml-[-2px]" />
      </button>

      <button
        onClick={scrollNext}
        className="absolute right-6 md top-[35%] -translate-y-1/2 w-12 h-12 bg-[#FAF8F5] border border-[#E8E4DF] rounded-full shadow-[0_8px_30px_rgba(28,25,23,0.12)] flex items-center justify-center z-10 text-[#1C1917] transition-all hover:bg-[#1C1917] hover:text-[#FAF8F5] opacity-0 group-hover:opacity-100"
        aria-label="Next slide"
      >
        <ChevronRight size={32} strokeWidth={1.5} className="mr-[-2px]" />
      </button>
    </div>
  );
}
