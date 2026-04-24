"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import useEmblaCarousel from "embla-carousel-react";
import { getEventStatus } from "@omenai/shared-utils/src/getEventStatus";
import { ShowsCarouselSkeleton } from "./ShowsCarouselSkeleton";
import { getFeaturedShows } from "@omenai/shared-services/events/getFeaturedShows";
import { getPromotionalOptimizedImage } from "@omenai/shared-lib/storage/getPromotionalsFileView";
import { IoArrowForward } from "react-icons/io5";
import { ChevronLeft, ChevronRight } from "lucide-react";

// The Fetcher Function for React Query
const fetchFeaturedShows = async () => {
  const response = await getFeaturedShows();
  if (!response.isOk) {
    throw new Error("Network response was not ok");
  }
  return response.data;
};

export const FeaturedShowsSection = () => {
  const {
    data: shows,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["featuredShows"],
    queryFn: fetchFeaturedShows,
  });

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    dragFree: true,
  });

  // Embla Navigation State
  const [prevBtnEnabled, setPrevBtnEnabled] = useState(false);
  const [nextBtnEnabled, setNextBtnEnabled] = useState(false);

  const scrollPrev = useCallback(
    () => emblaApi && emblaApi.scrollPrev(),
    [emblaApi],
  );
  const scrollNext = useCallback(
    () => emblaApi && emblaApi.scrollNext(),
    [emblaApi],
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setPrevBtnEnabled(emblaApi.canScrollPrev());
    setNextBtnEnabled(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  if (isError || (shows && shows.length === 0)) return null;

  return (
    <section className="w-full bg-white overflow-hidden">
      <div className=" max-w-[1800px] mx-auto">
        {/* Responsive Header Strip */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-neutral-200 pb-6">
          <div>
            <h2 className="font-serif text-2xl md:text-3xl font-light text-black leading-none tracking-tight">
              Featured Shows
            </h2>
            <div className="w-[60px] h-[3px] bg-[#C9A96E] my-5"></div>

            <p className="font-sans text-sm text-neutral-500 mt-2">
              Explore current and upcoming exhibitions from our gallery network.
            </p>
          </div>

          <Link
            href="/shows"
            className="group flex items-center gap-2 font-sans text-[10px] uppercase tracking-[0.2em] font-bold text-black border-b border-transparent hover:border-black transition-all pb-1 self-start md:self-auto"
          >
            View All Shows
            <IoArrowForward
              className="transition-transform duration-300 group-hover:translate-x-1"
              size={14}
            />
          </Link>
        </div>

        {/* Dynamic Content Area */}
        {isLoading ? (
          <ShowsCarouselSkeleton />
        ) : (
          <div className="relative group/carousel -mx-4 md:mx-0 px-4 md:px-0">
            {/* The Carousel */}
            <div className="overflow-hidden w-full" ref={emblaRef}>
              <div className="flex touch-pan-y space-x-6 md:space-x-8">
                {shows.map((show: any) => {
                  const status = getEventStatus(show.start_date, show.end_date);
                  const isClosed = status === "Past";

                  return (
                    <div
                      key={show.event_id}
                      className="flex-[0_0_85%] sm:flex-[0_0_45%] md:flex-[0_0_35%] lg:flex-[0_0_28%] min-w-0 group/card"
                    >
                      <Link
                        href={`/shows/${show.event_id}`}
                        className="block w-full"
                      >
                        <div className="relative w-full aspect-[3/2] bg-[#fafafa] overflow-hidden mb-5 border border-neutral-100">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={getPromotionalOptimizedImage(
                              show.cover_image,
                              "medium",
                            )}
                            alt={show.title}
                            className={`w-full h-full object-cover transition-transform duration-700 ease-out group-hover/card:scale-105 ${
                              isClosed ? "grayscale-[50%] opacity-80" : ""
                            }`}
                          />
                          <div className="absolute top-3 left-3">
                            <span
                              className={`px-3 py-1.5 font-sans text-[9px] uppercase tracking-widest font-bold ${
                                isClosed
                                  ? "bg-black text-white"
                                  : "bg-white text-black shadow-sm"
                              }`}
                            >
                              {isClosed
                                ? "Closed"
                                : show.event_type.replace("_", " ")}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col space-y-2 pr-4">
                          <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-neutral-500">
                            {show.gallery?.name || "Gallery"}
                          </span>
                          <h3 className="font-serif text-sm md:text-lg font-normal text-black leading-snug line-clamp-2 group-hover/card:text-neutral-500 transition-colors ">
                            {show.title}
                          </h3>
                          <div className="flex gap-x-2 items-center">
                            {show.location && (
                              <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-neutral-400">
                                {show.location.city}, {show.location.country} -
                              </p>
                            )}

                            <p className="font-sans text-[10px] uppercase tracking-widest text-neutral-400 font-medium">
                              {new Date(show.start_date).toLocaleDateString(
                                "en-US",
                                { month: "short", day: "numeric" },
                              )}{" "}
                              —{" "}
                              {new Date(show.end_date).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                },
                              )}
                            </p>
                          </div>
                        </div>
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              onClick={scrollPrev}
              className="absolute left-6 top-[35%] -translate-y-1/2 w-12 h-12 bg-[#FAF8F5] border border-[#E8E4DF] rounded-full shadow-[0_8px_30px_rgba(28,25,23,0.12)] flex items-center justify-center z-10 text-[#1C1917] transition-all hover:bg-[#1C1917] hover:text-[#FAF8F5] opacity-0 group-hover:opacity-100"
              aria-label="Previous slide"
            >
              <ChevronLeft size={32} strokeWidth={1.5} className="ml-[-2px]" />
            </button>

            <button
              onClick={scrollNext}
              className="absolute right-6 md top-[35%] -translate-y-1/2 w-12 h-12 bg-[#FAF8F5] border border-[#E8E4DF] rounded-full shadow-[0_8px_30px_rgba(28,25,23,0.12)] flex items-center justify-center z-10 text-[#1C1917] transition-all hover:bg-[#1C1917] hover:text-[#FAF8F5] opacity-0 group-hover:opacity-100"
              aria-label="Next slide"
            >
              <ChevronRight size={32} strokeWidth={1.5} className="mr-[-2px]" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
