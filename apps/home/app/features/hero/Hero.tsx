"use client";

import React, { useCallback, useState } from "react";

import useEmblaCarousel from "embla-carousel-react";
import SingleSlide from "./components/SingleSlide";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";
import { MdOutlineKeyboardArrowLeft } from "react-icons/md";

export default function Hero({ promotionals }: any) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    watchDrag: false,
  });
  const [scroll, setScroll] = useState<number>(1);

  const scrollPrev = useCallback(() => {
    if (emblaApi) {
      emblaApi.scrollPrev();
      setScroll((prev) => (prev === 2 ? 1 : 2));
    }
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) {
      emblaApi.scrollNext();
      setScroll((prev) => (prev === 2 ? 1 : 2));
    }
  }, [emblaApi]);

  return (
    <div className="embla" ref={emblaRef}>
      <div className="embla__container">
        {promotionals.map((promotional: any, index: number) => {
          return (
            <div
              className="embla__slide"
              key={promotional.id || promotional.heading || index}
            >
              <SingleSlide
                headline={promotional.headline}
                subheadline={promotional.subheadline}
                cta={promotional.cta}
                image={promotional.image}
              />
            </div>
          );
        })}
      </div>

      <div className="w-full flex gap-x-4 items-center my-3 px-6">
        <div className="w-full h-[2px] bg-[#fafafa] flex justify-center space-x-2 items-center">
          {/* User */}
          <div
            onClick={scrollPrev}
            className={`h-[1px] w-full rounded-full duration-500 cursor-pointer ${
              scroll === 1 ? "bg-dark" : "bg-transparent text-dark"
            } `}
          />
          <div
            onClick={scrollNext}
            className={`h-[1px] w-full rounded-full duration-500 cursor-pointer ${
              scroll === 2 ? "bg-dark" : "bg-transparent text-dark"
            } `}
          />
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
      {/* <p>{scroll}</p> */}
    </div>
  );
}
