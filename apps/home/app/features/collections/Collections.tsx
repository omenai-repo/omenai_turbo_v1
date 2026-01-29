"use client";
import React, { useCallback, useEffect, useState } from "react";
import ArtCollectionCard from "./ArtCollectionCard";
import {
  MdOutlineKeyboardArrowLeft,
  MdOutlineKeyboardArrowRight,
} from "react-icons/md";
import useEmblaCarousel from "embla-carousel-react";
import { collections } from "../../collectionConstants";
import Link from "next/link";
import { IoArrowForward } from "react-icons/io5";

export default function Collections({
  isCatalog = false,
}: {
  isCatalog?: boolean;
}) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: "start",
    containScroll: "trimSnaps",
    dragFree: true,
  });

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const onSelect = useCallback((api: any) => {
    setCanScrollPrev(api.canScrollPrev());
    setCanScrollNext(api.canScrollNext());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect(emblaApi);
    emblaApi.on("reInit", onSelect);
    emblaApi.on("select", onSelect);
  }, [emblaApi, onSelect]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  // CATALOG MODE
  if (isCatalog) {
    return (
      <div className="w-full bg-white border-b border-neutral-100">
        <div className="px-6 lg:px-12 py-16">
          <h1 className="font-serif text-4xl text-dark  mb-2">
            Browse Collections
          </h1>
          <p className="font-sans text-sm text-neutral-500">
            Explore artworks categorized by medium and style.
          </p>
        </div>
      </div>
    );
  }

  // HOMEPAGE MODE
  return (
    <section className="w-full bg-[#f5f5f5] py-8 border-t border-neutral-200">
      <div className="px-6 lg:px-12">
        {/* 1. MARKETPLACE HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <div>
            <span className="block mb-3 text-[9px] font-mono text-dark  tracking-wide uppercase">
              Curated Series
            </span>
            <h2 className="text-2xl md:text-3xl font-serif text-dark ">
              Shop by Category
            </h2>
          </div>

          {/* Controls - Top Right for Efficiency */}
          <div className="flex items-center gap-3">
            <button
              onClick={scrollPrev}
              disabled={!canScrollPrev}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-300 bg-white text-dark  transition-all hover:border-[#091830] hover:bg-[#091830] hover:text-white disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-dark "
            >
              <MdOutlineKeyboardArrowLeft className="text-xl" />
            </button>
            <button
              onClick={scrollNext}
              disabled={!canScrollNext}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-300 bg-white text-dark  transition-all hover:border-[#091830] hover:bg-[#091830] hover:text-white disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-dark "
            >
              <MdOutlineKeyboardArrowRight className="text-xl" />
            </button>
          </div>
        </div>

        {/* 2. CAROUSEL */}
        <div className="embla overflow-hidden" ref={emblaRef}>
          <div className="embla__container flex gap-4 md:gap-6">
            {collections.map((collection) => (
              <div key={collection.title} className="flex-[0_0_auto]">
                {/* Fixed width cards for consistent browsing rhythm */}
                <div className="w-[280px] md:w-[320px]">
                  <ArtCollectionCard
                    isCatalog={isCatalog}
                    title={collection.title}
                    url={collection.url}
                  />
                </div>
              </div>
            ))}
            {/* "View All" Card at the end */}
            <div className="flex-[0_0_auto] flex items-center">
              <Link
                href="/catalog"
                className="group flex h-[400px] w-[200px] flex-col items-center justify-center gap-4 rounded-md border-2 border-dashed border-neutral-300 bg-white p-6 text-center transition-colors hover:border-[#091830]"
              >
                <span className="h-12 w-12 rounded-full bg-neutral-100 flex items-center justify-center group-hover:bg-[#091830] group-hover:text-white transition-colors">
                  <IoArrowForward className="text-xl" />
                </span>
                <span className="font-sans text-sm font-semibold text-dark ">
                  View All Categories
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
