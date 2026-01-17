"use client";

import React, { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import {
  MdOutlineKeyboardArrowLeft,
  MdOutlineKeyboardArrowRight,
} from "react-icons/md";
import PromotionalCard from "@omenai/shared-ui-components/components/promotionals/PromotionalCard";

export default function Hero({ promotionals }: any) {
  // Carousel Setup
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "center", // Center alignment works well for a Hero spotlight
    skipSnaps: false,
    duration: 40, // Slower, heavier feel for the drag
  });

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on("select", onSelect);
    onSelect();
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  const scrollPrev = useCallback(
    () => emblaApi && emblaApi.scrollPrev(),
    [emblaApi]
  );
  const scrollNext = useCallback(
    () => emblaApi && emblaApi.scrollNext(),
    [emblaApi]
  );

  return (
    <section className="relative w-full bg-[#FAFAFA] pt-12 pb-20 border-b border-neutral-200">
      {/* 1. ARCHITECTURAL HEADER */}
      <div className="container mx-auto px-6 lg:px-12 mb-12">
        <div className="flex flex-col gap-4 max-w-2xl">
          <div className="flex items-center gap-3">
            <div className="h-1.5 w-1.5 bg-dark" />
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-neutral-500">
              Curated Highlights
            </span>
          </div>

          <h1 className="font-serif text-5xl md:text-6xl text-neutral-900 leading-[1.1]">
            This Week on{" "}
            <span className="italic text-neutral-400">Omenai.</span>
          </h1>
        </div>
      </div>

      {/* 2. THE STAGE (Carousel) */}
      <div className="w-full overflow-hidden" ref={emblaRef}>
        <div className="flex touch-pan-y">
          {promotionals.map((promotional: any, index: number) => (
            <div
              className="flex-[0_0_85%] md:flex-[0_0_70%] min-w-0 pl-4 md:pl-12 relative"
              key={promotional.id || index}
            >
              {/* Focus Interaction: 
                 Active slide is full opacity. 
                 Inactive slides are faded (opacity-30) and grayscale until hovered.
              */}
              <div
                className={`transition-all duration-1000 ease-out ${
                  index === selectedIndex
                    ? "opacity-100 scale-100 grayscale-0"
                    : "opacity-30 scale-95 grayscale hover:opacity-100 hover:grayscale-0"
                }`}
              >
                <PromotionalCard {...promotional} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. THE DASHBOARD (Controls & Progress) */}
      <div className="container mx-auto px-6 lg:px-12 mt-12">
        <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-8 pt-6 border-t border-neutral-200">
          {/* Progress Bar (Anchored Left) */}
          <div className="w-full md:max-w-md flex items-center gap-6">
            <div className="font-mono text-xs text-dark">
              {String(selectedIndex + 1).padStart(2, "0")}
            </div>

            <div className="relative h-[1px] flex-1 bg-neutral-200">
              <div
                className="absolute top-0 left-0 h-full bg-dark transition-all duration-500 ease-out"
                style={{
                  width: `${((selectedIndex + 1) / scrollSnaps.length) * 100}%`,
                }}
              />
            </div>

            <div className="font-mono text-xs text-neutral-400">
              {String(scrollSnaps.length).padStart(2, "0")}
            </div>
          </div>

          {/* Navigation Buttons (Strict Squares) */}
          <div className="flex gap-[-1px]">
            <button
              onClick={scrollPrev}
              className="flex h-12 w-12 items-center justify-center border border-neutral-200 bg-white text-neutral-900 transition-all hover:border-black hover:bg-dark hover:text-white rounded-none"
            >
              <MdOutlineKeyboardArrowLeft className="text-xl" />
            </button>
            <button
              onClick={scrollNext}
              className="flex h-12 w-12 items-center justify-center border-y border-r border-neutral-200 bg-white text-neutral-900 transition-all hover:border-black hover:bg-dark hover:text-white rounded-none"
            >
              <MdOutlineKeyboardArrowRight className="text-xl" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
