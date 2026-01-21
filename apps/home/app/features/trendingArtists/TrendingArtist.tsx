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
  }, [emblaApi, onSelect]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  if (!artists || artists.length === 0) return null;

  return (
    <div className="w-full relative group/carousel">
      {/* CONTROLS - Floating on Desktop, hidden on mobile (swipe enabled) */}
      <div className="hidden lg:flex absolute -top-20 right-0 gap-2">
        <button
          onClick={scrollPrev}
          disabled={!canScrollPrev}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-300 bg-white text-dark  transition-all hover:border-[#091830] hover:bg-[#091830] hover:text-white disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-dark "
        >
          <MdOutlineKeyboardArrowLeft className="text-xl" />
        </button>
        <button
          onClick={scrollNext}
          disabled={!canScrollNext}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-300 bg-white text-dark  transition-all hover:border-[#091830] hover:bg-[#091830] hover:text-white disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-dark "
        >
          <MdOutlineKeyboardArrowRight className="text-xl" />
        </button>
      </div>

      {/* CAROUSEL VIEWPORT */}
      <div className="embla overflow-hidden" ref={emblaRef}>
        <div className="embla__container flex gap-6">
          {artists.map((artist: any) => {
            return (
              <div
                className="embla__slide min-w-0 flex-[0_0_auto]"
                key={artist.author_id}
              >
                {/* Fixed Width Card */}
                <div className="w-[280px] md:w-[320px]">
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
    </div>
  );
}
