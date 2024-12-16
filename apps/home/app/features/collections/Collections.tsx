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

export default function Collections() {
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
    <div className="p-4">
      <div className="flex gap-4 my-5 flex-col md:flex-row">
        <div className="space-y-1 flex-1">
          <h1 className="text-sm md:text-md font-normal">Art Collections</h1>
          <p className="text-base md:text-sm text-[#858585] font-light italic">
            Dive Into Diverse Art Collections, Thoughtfully Curated for Your
            Exploration
          </p>
        </div>
        <Link
          href={"/collections"}
          className="text-dark flex items-center gap-x-2 font-normal text-[14px] break-words"
        >
          View all
          <MdArrowRightAlt />
        </Link>
      </div>

      <div className="embla" ref={emblaRef}>
        <div className="embla__container">
          {/* <div className="embla__slide">
          <DefaultHeroSlides />
        </div> */}
          {collections.map((collection, index) => {
            return (
              <div key={collection.title} className="mx-2">
                <ArtCollectionCard
                  title={collection.title}
                  url={collection.url}
                />
              </div>
            );
          })}
        </div>

        <div className="w-full flex gap-x-4 items-center my-3 mt-8">
          <div className=" w-full h-[1px] bg-[#fafafa]">
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

        {/* <div className="flex relative gap-x-4 overflow-x-scroll w-full"></div> */}
      </div>
    </div>
  );
}
