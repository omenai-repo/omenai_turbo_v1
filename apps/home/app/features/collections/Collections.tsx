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
          <h1 className="text-fluid-base sm:text-fluid-sm md:text-fluid-lg font-normal mt-5 text-[#000000]">
            Curate creativity and design in the digital realm.
          </h1>
          <hr className="w-full border border-dark/10 my-2" />
        </>
      ) : (
        <div className="flex md:flex-row flex-col gap-4 mb-5">
          <div className="flex justify-between items-center w-full my-5">
            <div>
              <p className="text-[12px] ring-1 px-3 w-fit py-1 rounded-full ring-dark font-medium text-[#000000] my-5">
                Art collections
              </p>
              <p className="text-fluid-sm sm:text-fluid-md font-bold text-[#000000] mt-[20px]">
                Art collections.
              </p>
            </div>

            <div className="hidden sm:flex flex-col items-end">
              <p className="text-fluid-base font-bold">
                Curated Creativity, All in One Place:
              </p>
              <p className="justify-self-end font-medium text-fluid-xxs">
                Dive Into Diverse Art Collections,
              </p>
              <p className="justify-self-end font-medium text-fluid-xxs">
                Thoughtfully Curated for Your Exploration
              </p>
            </div>
          </div>
        </div>
      )}
      <div className="embla" ref={emblaRef}>
        <div className="embla__container">
          {/* <div className="embla__slide">
          <DefaultHeroSlides />
        </div> */}
          {collections.map((collection, index) => {
            return (
              <div key={collection.title} className="mx-2">
                <ArtCollectionCard
                  isCatalog={isCatalog}
                  title={collection.title}
                  url={collection.url}
                />
              </div>
            );
          })}
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
              className="h-[35px] w-[40px] rounded-full border border-[#e0e0e0] bg-transparent hover:border-dark duration-300 grid place-items-center"
            >
              <MdOutlineKeyboardArrowLeft />
            </button>
            <button
              onClick={scrollNext}
              className="h-[35px] w-[40px] rounded-full border border-[#e0e0e0] bg-transparent hover:border-dark duration-300 grid place-items-center"
            >
              <MdOutlineKeyboardArrowRight />
            </button>
          </div>
        </div>

        {/* <div className="flex relative gap-x-4 overflow-x-scroll w-full"></div> */}
      </div>
    </div>
  );
}
