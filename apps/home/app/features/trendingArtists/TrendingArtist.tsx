import { TrendingArtistCard } from "@omenai/shared-ui-components/components/artists/TrendingArtistCard";
import useEmblaCarousel from "embla-carousel-react";
import React, { useState, useEffect, useCallback } from "react";
import {
  MdOutlineKeyboardArrowLeft,
  MdOutlineKeyboardArrowRight,
} from "react-icons/md";
export default function TrendingArtist({ artists }: { artists: any }) {
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
    <div>
      {artists.length > 0 ? (
        <div className="flex gap-x-4">
          {artists.map((artist: any) => {
            return (
              <TrendingArtistCard
                key={artist.author_id}
                artist={artist.artist}
                likes={artist.totalLikes}
                url={artist.mostLikedArtwork.url}
                birthyear={artist.mostLikedArtwork.birthyear}
                country={artist.mostLikedArtwork.country}
                artist_id={artist.author_id}
              />
            );
          })}
        </div>
      ) : null}

      <div className="w-full flex gap-x-4 items-center my-3">
        <div className=" w-full h-[1px] bg-[#fafafa]">
          <div
            className="h-full bg-dark "
            style={{ width: `${scrollProgress * 100}%` }}
          ></div>
        </div>

        <div className="flex items-center justify-center w-fit space-x-2">
          <button
            onClick={scrollPrev}
            className="h-[35px] w-[40px] rounded-md border border-[#e0e0e0] bg-dark text-white hover:border-dark duration-300 grid place-items-center"
          >
            <MdOutlineKeyboardArrowLeft />
          </button>
          <button
            onClick={scrollNext}
            className="h-[35px] w-[40px] rounded-md border border-[#e0e0e0] bg-dark text-white hover:border-dark duration-300 grid place-items-center"
          >
            <MdOutlineKeyboardArrowRight />
          </button>
        </div>
      </div>

      {/* <div className="flex relative gap-x-4 overflow-x-scroll w-full"></div> */}
    </div>
  );
}
