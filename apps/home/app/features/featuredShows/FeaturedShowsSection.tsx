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
            <h2 className="text-3xl font-serif font-light text-dark">
              Featured Shows
            </h2>
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
                          <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-neutral-500 font-bold">
                            {show.gallery?.name || "Gallery"}
                          </span>
                          <h3 className="font-serif text-lg md:text-xl font-normal text-black leading-snug line-clamp-2 group-hover/card:text-neutral-500 transition-colors ">
                            {show.title}
                          </h3>
                          <div className="flex gap-x-2 items-center">
                            {show.location && (
                              <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-neutral-400 font-medium">
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

            {/* Left Navigation Button */}
            <button
              onClick={scrollPrev}
              disabled={!prevBtnEnabled}
              className="absolute left-0 top-[35%] z-10 -ml-4 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-md border border-neutral-100 text-black transition-all duration-300 hover:scale-105 disabled:opacity-0disabled:pointer-events-none md:-ml-5 opacity-0 group-hover/carousel:opacity-100"
              aria-label="Previous shows"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 19.5L8.25 12l7.5-7.5"
                />
              </svg>
            </button>

            {/* Right Navigation Button */}
            <button
              onClick={scrollNext}
              disabled={!nextBtnEnabled}
              className="absolute right-0 top-[35%] z-10 -mr-4 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-md border border-neutral-100 text-black transition-all duration-300 hover:scale-105 disabled:opacity-0 disabled:pointer-events-none md:-mr-5 opacity-0 group-hover/carousel:opacity-100"
              aria-label="Next shows"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.25 4.5l7.5 7.5-7.5 7.5"
                />
              </svg>
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
