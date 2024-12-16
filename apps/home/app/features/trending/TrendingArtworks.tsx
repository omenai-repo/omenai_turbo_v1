"use client";
import TrendingArtworkCard from "./TrendingArtCard";

import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import { useState, useEffect, useCallback } from "react";
import {
  MdOutlineKeyboardArrowLeft,
  MdOutlineKeyboardArrowRight,
} from "react-icons/md";

export default function TrendingArtworks({
  sessionId,
  artworks,
}: {
  artworks: any;
  sessionId: string | undefined;
}) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    watchDrag: true,
  });
  const [scrollProgress, setScrollProgress] = useState(0);

  const updateScrollProgress = () => {
    if (!emblaApi) return;
    const progress = Math.max(0, Math.min(1, emblaApi.scrollProgress()));
    setScrollProgress(progress);
  };

  useEffect(() => {
    if (!emblaApi) return;

    const handleScroll = () => {
      requestAnimationFrame(updateScrollProgress);
    };

    emblaApi.on("scroll", handleScroll);
    emblaApi.on("resize", updateScrollProgress);
    updateScrollProgress(); // Initial progress update

    return () => {
      emblaApi.off("scroll", handleScroll);
      emblaApi.off("resize", updateScrollProgress);
    };
  }, [emblaApi]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) {
      emblaApi.scrollPrev();
    }
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) {
      emblaApi.scrollNext();
    }
  }, [emblaApi]);
  return (
    <>
      {artworks.length > 0 && (
        <div className="p-4 relative">
          <div className="embla" ref={emblaRef}>
            <div className="embla__container">
              {artworks.map((artwork: any, index: number) => {
                if (artwork.impressions === 0) return null;
                return (
                  <TrendingArtworkCard
                    key={artwork.art_id}
                    name={artwork.title}
                    image={artwork.url}
                    artist={artwork.artist}
                    impressions={artwork.impressions}
                    medium={artwork.medium}
                    rarity={artwork.rarity}
                    likeIds={artwork.like_IDs}
                    sessionId={sessionId}
                    art_id={artwork.art_id}
                    availability={artwork.availability}
                  />
                );
              })}
              {artworks.length >= 25 && (
                <div className="h-[400px] w-[250px] grid place-items-center mx-10">
                  <Link href={""}>
                    <button className="whitespace-nowrap border border-dark rounded-full bg-transparent text-xs disabled:bg-[#E0E0E0] disabled:text-[#858585]  w-full text-dark disabled:cursor-not-allowed h-[40px] px-4 flex gap-x-2 items-center justify-center hover:bg-dark hover:text-white duration-300">
                      View all trending artworks
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      <div className="w-full flex gap-x-4 items-center mb-5 px-6">
        <div className=" w-full h-[0.5px] bg-[#fafafa]">
          <div
            className="h-full bg-dark "
            style={{ width: `${scrollProgress * 100}%` }}
          ></div>
        </div>

        <div className="flex items-center justify-center w-fit space-x-2">
          <button
            onClick={scrollPrev}
            className="h-[40px] w-[40px] rounded-full border border-[#e0e0e0] bg-transparent hover:border-dark duration-300 grid place-items-center"
          >
            <MdOutlineKeyboardArrowLeft />
          </button>
          <button
            onClick={scrollNext}
            className="h-[40px] w-[40px] rounded-full border border-[#e0e0e0] bg-transparent hover:border-dark duration-300 grid place-items-center"
          >
            <MdOutlineKeyboardArrowRight />
          </button>
        </div>
      </div>
    </>
  );
}
