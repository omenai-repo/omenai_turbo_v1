"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import ArtCollectionCard from "./ArtCollectionCard";
import {
  MdArrowRightAlt,
  MdOutlineKeyboardArrowLeft,
  MdOutlineKeyboardArrowRight,
} from "react-icons/md";

import useEmblaCarousel from "embla-carousel-react";
import Link from "next/link";
import { collections } from "../../collectionConstants";

export default function Collections({
  isCatalog = false,
}: {
  isCatalog?: boolean;
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
    <div className="">
      {isCatalog ? (
        <>
          <h1 className="text-fluid-base sm:text-fluid-sm md:text-fluid-lg font-medium mt-6 text-black tracking-tight">
            Curate creativity and design in the digital realm.
          </h1>

          <hr className="w-full border border-dark/10 my-4" />
        </>
      ) : (
        <div className="flex md:flex-row flex-col gap-4 mb-8">
          <div className="flex justify-between items-start w-full mt-6">
            <div className="space-y-2">
              <p className="text-fluid-xxs font-medium text-dark/60 border-b border-dark/10 pb-1 w-fit">
                Art collections
              </p>

              <p className="text-fluid-base sm:text-fluid-md font-semibold text-black leading-snug max-w-lg">
                Curated Visions: Explore Omenai's Art Collections
              </p>
            </div>

            <div className="hidden sm:flex flex-col items-end space-y-0.5 text-right">
              <p className="text-fluid-base font-semibold text-black">
                Curated Creativity, All in One Place:
              </p>
              <p className="font-normal text-fluid-xxs text-dark/70 leading-snug">
                Dive Into Diverse Art Collections,
              </p>
              <p className="font-normal text-fluid-xxs text-dark/70 leading-snug">
                Thoughtfully Curated for Your Exploration
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="embla" ref={emblaRef}>
        <div className="embla__container flex gap-4 py-2">
          {collections.map((collection, index) => {
            return (
              <div
                key={collection.title}
                className="mx-2 transition-transform duration-300 hover:scale-[1.02]"
              >
                <ArtCollectionCard
                  isCatalog={isCatalog}
                  title={collection.title}
                  url={collection.url}
                />
              </div>
            );
          })}
        </div>
      </div>

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
            className="h-[35px] w-[40px] rounded-full border border-[#e0e0e0] bg-dark text-white hover:border-dark duration-300 grid place-items-center"
          >
            <MdOutlineKeyboardArrowLeft />
          </button>
          <button
            onClick={scrollNext}
            className="h-[35px] w-[40px] rounded-full border border-[#e0e0e0] bg-dark text-white hover:border-dark duration-300 grid place-items-center"
          >
            <MdOutlineKeyboardArrowRight />
          </button>
        </div>
      </div>

      {/* <div className="flex relative gap-x-4 overflow-x-scroll w-full"></div> */}
    </div>
  );
}
