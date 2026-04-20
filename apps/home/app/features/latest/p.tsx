// components/public/FeaturedShowsSection.tsx
"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import useEmblaCarousel from "embla-carousel-react";
import { getOptimizedImage } from "@omenai/shared-lib/storage/getImageFileView";
import { getEventStatus } from "@omenai/shared-utils/src/getEventStatus";
import { getFeaturedShows } from "@omenai/shared-services/events/getFeaturedShows";
import { getPromotionalOptimizedImage } from "@omenai/shared-lib/storage/getPromotionalsFileView";
// The Fetcher Function for React Query
const fetchFeaturedShows = async () => {
  const response = await getFeaturedShows();
  console.log(response);
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
    <section className="w-full py-12 bg-white">
      <div className="max-w-[1600px] mx-auto">
        {/* Responsive Header Strip */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 border-b border-neutral-200 pb-4">
          <div>
            <h2 className="text-3xl font-light text-dark">Featured Shows</h2>
            <p className="text-sm text-neutral-600 mt-2 font-light">
              Explore current and upcoming exhibitions from our gallery network.
            </p>
          </div>

          <Link
            href="/shows"
            className="text-[10px] uppercase tracking-widest font-medium text-dark hover:text-neutral-600 transition-colors pb-1 border-b border-transparent hover:border-neutral-600 sm:shrink-0 self-start sm:self-auto"
          >
            View All Shows
          </Link>
        </div>

        {/* Dynamic Content Area */}
        {isLoading ? (
          <></>
        ) : (
          <div className="relative group">
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
                        {/* CHANGED: aspect-[4/5] to aspect-[3/2] */}
                        <div className="relative w-full aspect-[3/2] bg-neutral-50 overflow-hidden mb-4 rounded-sm border border-neutral-100">
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
                          <div className="absolute top-4 left-4">
                            <span
                              className={`px-2.5 py-1 text-[9px] uppercase tracking-widest font-medium rounded-sm backdrop-blur-md ${
                                isClosed
                                  ? "bg-black/60 text-white"
                                  : "bg-white/90 text-dark shadow-sm"
                              }`}
                            >
                              {isClosed
                                ? "Closed"
                                : show.event_type.replace("_", " ")}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col space-y-1 pr-4">
                          <span className="text-xs text-neutral-600 font-normal tracking-wide">
                            {show.gallery?.name || "Gallery"}
                          </span>
                          <h3 className="text-xl font-normal text-dark leading-tight line-clamp-2 group-hover/card:text-neutral-600 transition-colors">
                            {show.title}
                          </h3>
                          <p className="text-[11px] text-neutral-500 tracking-wide uppercase pt-1">
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
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Left Navigation Button */}
            {prevBtnEnabled && (
              <button
                onClick={scrollPrev}
                className="absolute left-2 sm:-left-4 md:-left-6 top-[35%] -translate-y-1/2 p-3 sm:p-4 bg-white/90 backdrop-blur-md border border-neutral-200 text-neutral-600 rounded-full shadow-sm hover:text-dark hover:border-neutral-300 hover:bg-white transition-all duration-300 z-10 opacity-0 group-hover:opacity-100 focus:opacity-100"
                aria-label="Previous shows"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
            )}

            {/* Right Navigation Button */}
            {nextBtnEnabled && (
              <button
                onClick={scrollNext}
                className="absolute right-2 sm:-right-4 md:-right-6 top-[35%] -translate-y-1/2 p-3 sm:p-4 bg-white/90 backdrop-blur-md border border-neutral-200 text-neutral-600 rounded-full shadow-sm hover:text-dark hover:border-neutral-300 hover:bg-white transition-all duration-300 z-10 opacity-0 group-hover:opacity-100 focus:opacity-100"
                aria-label="Next shows"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
