"use client";
import ArtworkCard from "@omenai/shared-ui-components/components/artworks/ArtworkCard";

import useEmblaCarousel from "embla-carousel-react";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { FiChevronRight } from "react-icons/fi";
import {
  MdArrowRightAlt,
  MdOutlineKeyboardArrowLeft,
  MdOutlineKeyboardArrowRight,
} from "react-icons/md";

export default function CuratedArtworksLayout({
  sessionId,
  userCuratedArtworks,
}: {
  sessionId: string | undefined;
  userCuratedArtworks: any;
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
      <div className="px-4 py-8 relative">
        <div className="embla" ref={emblaRef}>
          <div className="embla__container">
            {userCuratedArtworks.map((artwork: any, index: number) => {
              return (
                <ArtworkCard
                  image={artwork.url}
                  key={artwork.art_id}
                  artist={artwork.artist}
                  name={artwork.title}
                  pricing={artwork.pricing}
                  impressions={artwork.impressions}
                  likeIds={artwork.like_IDs}
                  sessionId={sessionId}
                  art_id={artwork.art_id}
                  availability={artwork.availability}
                />
              );
            })}
            {userCuratedArtworks.length >= 20 && (
              <div className="h-[400px] w-[250px] grid place-items-center mx-16">
                <Link href={""}>
                  <button className="whitespace-nowrap border border-dark rounded-full bg-transparent text-xs disabled:bg-[#E0E0E0] disabled:text-[#858585]  w-full text-dark disabled:cursor-not-allowed h-[40px] px-4 flex gap-x-2 items-center justify-center hover:bg-dark hover:text-white duration-300">
                    View more
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Controls */}

      <div className="w-full flex gap-x-4 items-center my-3 mt-8 px-6">
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
