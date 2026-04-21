"use client";

import React, { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ArtworkSchemaTypes } from "@omenai/shared-types";
import ArtworkCard from "@omenai/shared-ui-components/components/artworks/ArtworkCard";

export default function LatestArtworks({
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
              <ArtworkCard
                key={art.art_id}
                image={art.url}
                name={art.title}
                artist={art.artist}
                art_id={art.art_id}
                pricing={art.pricing}
                impressions={art.impressions as number}
                likeIds={art.like_IDs as string[]}
                sessionId={sessionId}
                availability={art.availability}
                medium={art.medium}
                author_id={art.author_id}
                image_format={art.image_format}
              />
            </div>
          ))}
        </div>
      </div>

      {/* ─── Previous Button ─── */}
      <button
        onClick={scrollPrev}
        disabled={prevBtnDisabled}
        className="absolute left-0 top-1/2 z-10 -ml-4 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-md border border-neutral-100 text-neutral-800 transition-all duration-300 hover:scale-105 disabled:opacity-0 disabled:pointer-events-none md:-ml-5"
        aria-label="Previous artwork"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 19.5L8.25 12l7.5-7.5"
          />
        </svg>
      </button>

      {/* ─── Next Button ─── */}
      <button
        onClick={scrollNext}
        disabled={nextBtnDisabled}
        className="absolute right-0 top-1/2 z-10 -mr-4 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-md border border-neutral-100 text-neutral-800 transition-all duration-300 hover:scale-105 disabled:opacity-0 disabled:pointer-events-none md:-mr-5"
        aria-label="Next artwork"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8.25 4.5l7.5 7.5-7.5 7.5"
          />
        </svg>
      </button>
    </div>
  );
}
