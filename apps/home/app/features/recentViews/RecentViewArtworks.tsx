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
      <div className="flex md:flex-row flex-col gap-4 mt-16">
        <div className="flex justify-between items-center w-full my-5">
          <div>
            <p className="text-fluid-xxs font-normal text-dark border-b border-dark/20 pb-1 my-5 w-fit">
              Recently viewed
            </p>
            <p className="text-fluid-base sm:text-fluid-md font-semibold text-[#000000] mt-[20px]">
              Recently viewed by you.
            </p>
          </div>

          <div className="hidden sm:flex flex-col items-end">
            <p className="text-fluid-base font-semibold">
              Back for a Second Look:
            </p>
            <p className="justify-self-end font-normal leading-snug text-fluid-xxs">
              Rediscover the Art
            </p>
            <p className="justify-self-end font-normal leading-snug text-fluid-xxs">
              That Captured Your Attention
            </p>
          </div>
        </div>
      </div>
      {artworks?.length > 0 && (
        <div className="embla" ref={emblaRef}>
          <div className="embla__container flex gap-4">
            {artworks.map((artwork: any, index: number) => {
              return (
                <RecentViewedCard
                  image={artwork.url}
                  key={index + artwork.art_id}
                  artist={artwork.artist}
                  name={artwork.artwork}
                />
              );
            })}
          </div>
        </div>
      )}

      <div className="w-full flex gap-x-4 items-center my-3 mt-8 px-6">
        <div className=" w-full h-[1px] bg-[#fafafa]">
          <div
            className="h-full bg-dark "
            style={{ width: `${scrollProgress * 100}%` }}
          ></div>
        </div>

        <div className="flex items-center justify-center w-fit space-x-2">
          <button
            onClick={scrollPrev}
            className="h-[35px] w-[40px] rounded border border-[#e0e0e0] bg-dark text-white hover:border-dark duration-300 grid place-items-center"
          >
            <MdOutlineKeyboardArrowLeft />
          </button>
          <button
            onClick={scrollNext}
            className="h-[35px] w-[40px] rounded border border-[#e0e0e0] bg-dark text-white hover:border-dark duration-300 grid place-items-center"
          >
            <MdOutlineKeyboardArrowRight />
          </button>
        </div>
      </div>
    </>
  );
}
