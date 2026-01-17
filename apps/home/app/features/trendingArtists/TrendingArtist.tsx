import { TrendingArtistCard } from "@omenai/shared-ui-components/components/artists/TrendingArtistCard";
import useEmblaCarousel from "embla-carousel-react";
import React, { useState, useEffect, useCallback } from "react";
import {
  MdOutlineKeyboardArrowLeft,
  MdOutlineKeyboardArrowRight,
} from "react-icons/md";

export default function TrendingArtist({ artists }: { artists: any }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    dragFree: true, // Allows "analog" feeling drag
  });

  const [scrollProgress, setScrollProgress] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  // Sync Progress Bar
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

  if (!artists || artists.length === 0) return null;

  return (
    <div className="w-full">
      {/* CAROUSEL VIEWPORT */}
      {/* We use overflow-visible on the x-axis partially or padding to avoid cutting off shadows */}
      <div className="embla overflow-hidden pb-10" ref={emblaRef}>
        <div className="embla__container flex gap-x-6 pl-0 md:gap-x-10">
          {artists.map((artist: any) => {
            return (
              <div
                className="embla__slide min-w-0 flex-[0_0_auto]"
                key={artist.author_id}
              >
                {/* FIXED WIDTH WRAPPER: 
                  This controls the card size. 
                  Mobile: 280px, Desktop: 340px (Portrait Size)
                */}
                <div className="w-[280px] md:w-[340px]">
                  <TrendingArtistCard
                    artist={artist.artist}
                    likes={artist.totalLikes}
                    url={artist.mostLikedArtwork.url}
                    birthyear={artist.mostLikedArtwork.birthyear}
                    country={artist.mostLikedArtwork.country}
                    artist_id={artist.author_id}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CONTROLS & TIMELINE FOOTER */}
      <div className="mt-6 flex flex-col gap-6 border-t border-neutral-100 pt-6 md:flex-row md:items-end md:justify-between">
        {/* 1. Progress Timeline */}
        <div className="relative h-[2px] w-full bg-neutral-100 md:max-w-md md:flex-1 md:mr-12">
          <div
            className="absolute top-0 left-0 h-full bg-dark transition-all duration-300 ease-out"
            style={{ width: `${scrollProgress * 100}%` }}
          />
        </div>

        {/* 2. Navigation Buttons (Square Geometry) */}
        <div className="flex items-center justify-between gap-4 md:justify-end">
          <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400">
            Navigate Roster
          </span>

          <div className="flex gap-[-1px]">
            <button
              onClick={scrollPrev}
              disabled={!canScrollPrev}
              className="flex h-12 w-12 items-center justify-center border border-neutral-200 bg-white text-neutral-900 transition-all duration-300 hover:border-black hover:bg-dark hover:text-white disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-neutral-900"
            >
              <MdOutlineKeyboardArrowLeft className="text-xl" />
            </button>
            <button
              onClick={scrollNext}
              disabled={!canScrollNext}
              className="flex h-12 w-12 items-center justify-center border-y border-r border-neutral-200 bg-white text-neutral-900 transition-all duration-300 hover:border-black hover:bg-dark hover:text-white disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-neutral-900"
            >
              <MdOutlineKeyboardArrowRight className="text-xl" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
