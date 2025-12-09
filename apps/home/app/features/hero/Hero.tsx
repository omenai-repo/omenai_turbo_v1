"use client";

import React, { useCallback, useEffect, useState } from "react";

import useEmblaCarousel from "embla-carousel-react";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";
import { MdOutlineKeyboardArrowLeft } from "react-icons/md";
import HomeBG from "./HomeBG";
import PromotionalCard from "@omenai/shared-ui-components/components/promotionals/PromotionalCard";
export default function Hero({ promotionals }: any) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    watchDrag: true,
    align: "start",
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
      {/* <HomeBG /> */}
      <div className="embla mb-6" ref={emblaRef}>
        <div className="embla__container space-x-3">
          {promotionals.map((promotional: any, index: number) => {
            return (
              <div
                className="embla__slide"
                key={promotional.id || promotional.heading || index}
              >
                <PromotionalCard
                  headline={promotional.headline}
                  subheadline={promotional.subheadline}
                  cta={promotional.cta}
                  image={promotional.image}
                />
              </div>
            );
          })}
        </div>

        {/* <p>{scroll}</p> */}
      </div>
      <div className="w-full flex gap-x-4 items-center px-6">
        <div className=" w-full h-[0.5px] bg-[#fafafa]">
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
    </>
  );
}
