// components/public/fairs/FairsAndEventsSection.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import useEmblaCarousel from "embla-carousel-react";
import { getOptimizedImage } from "@omenai/shared-lib/storage/getImageFileView";
import { getEventStatus } from "@omenai/shared-utils/src/getEventStatus";
import { FairsCarouselSkeleton } from "./FairsCarouselSkeleton";
import { getAllEvents } from "@omenai/shared-services/events/getAllEvents";
import { getPromotionalOptimizedImage } from "@omenai/shared-lib/storage/getPromotionalsFileView";
import { ChevronLeft, ChevronRight } from "lucide-react";
const fetchRecentFairsAndEvents = async () => {
  const response = await getAllEvents("1", "10", "All");
  if (!response.isOk) {
    throw new Error("Network response was not ok");
  }
  return response.data;
};

export const FairsAndEventsSection = () => {
  const {
    data: events,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["recentFairsEvents"],
    queryFn: fetchRecentFairsAndEvents,
    staleTime: 1000 * 60 * 5,
  });

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    dragFree: true,
  });

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

  if (isError || (events && events.length === 0)) return null;

  return (
    <section className="w-full">
      <div className="max-w-full mx-auto">
        {/* Header Strip */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 pb-4">
          <div>
            {/* font-serif for the elegant section header */}
            <h2 className="font-serif text-2xl md:text-3xl font-light text-black leading-none tracking-tight">
              Fairs & Events
            </h2>
            <div className="w-[60px] h-[3px] bg-[#C9A96E] my-5"></div>

            {/* font-sans for the UI description */}
            <p className="text-sm font-sans text-neutral-500 mt-2 font-light">
              Explore time-sensitive global art fairs and exclusive digital
              viewing rooms.
            </p>
          </div>

          <Link
            href="/events"
            className="text-xs font-sans uppercase tracking-widest font-medium text-dark hover:text-neutral-500 transition-colors pb-1 border-b border-transparent hover:border-neutral-500 sm:shrink-0 self-start sm:self-auto"
          >
            View All Fairs
          </Link>
        </div>

        {isLoading ? (
          <FairsCarouselSkeleton />
        ) : (
          <div className="relative group">
            <div className="overflow-hidden w-full" ref={emblaRef}>
              <div className="flex touch-pan-y space-x-6 md:space-x-8">
                {events.map((event: any) => {
                  const status = getEventStatus(
                    event.start_date,
                    event.end_date,
                  );
                  const isClosed = status === "Past";
                  const isFair = event.event_type === "art_fair";

                  return (
                    <div
                      key={event.event_id}
                      className="flex-[0_0_85%] sm:flex-[0_0_45%] md:flex-[0_0_35%] lg:flex-[0_0_28%] min-w-0 group/card"
                    >
                      <Link
                        href={`/events/${event.event_id}`}
                        className="block w-full"
                      >
                        {/* Image Container */}
                        <div className="relative w-full aspect-[3/2] bg-white overflow-hidden mb-4 rounded-sm border border-neutral-200">
                          <img
                            src={getPromotionalOptimizedImage(
                              event.cover_image,
                              "medium",
                            )}
                            alt={event.title}
                            className={`w-full h-full object-cover transition-transform duration-700 ease-out group-hover/card:scale-105 ${
                              isClosed ? "grayscale-[50%] opacity-80" : ""
                            }`}
                          />
                          <div className="absolute top-4 left-4">
                            <span
                              className={`px-2.5 py-1 text-[9px] font-sans uppercase tracking-widest font-medium rounded-sm backdrop-blur-md ${
                                isClosed
                                  ? "bg-black/60 text-white"
                                  : "bg-white/90 text-dark shadow-sm"
                              }`}
                            >
                              {isClosed
                                ? "Closed"
                                : event.event_type.replace("_", " ")}
                            </span>
                          </div>
                        </div>

                        {/* Metadata */}
                        <div className="flex flex-col space-y-1 pr-4">
                          <span className="text-xs font-sans text-neutral-500 font-medium tracking-wide">
                            {event.gallery?.name || "Gallery"}
                          </span>

                          {/* font-serif for the artistic title of the fair/room */}
                          <h1 className="text-md font-serif font-light text-dark leading-tight line-clamp-2 group-hover/card:text-neutral-600 transition-colors">
                            {event.title}
                          </h1>

                          {/* font-sans for utility details */}
                          <div className="text-[11px] font-sans text-neutral-400 tracking-wide uppercase pt-1 flex flex-col gap-0.5">
                            <p>
                              {new Date(event.start_date).toLocaleDateString(
                                "en-US",
                                { month: "short", day: "numeric" },
                              )}{" "}
                              —{" "}
                              {new Date(event.end_date).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                },
                              )}
                            </p>
                            {/* Display location specifically for physical Art Fairs */}
                            {isFair && event.location?.city && (
                              <p className="text-dark/60">
                                {event.location.city}
                                {event.location.country
                                  ? `, ${event.location.country}`
                                  : ""}
                              </p>
                            )}
                          </div>
                        </div>
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Navigation Buttons (font-sans styling applied implicitly via icons/layout) */}
            {prevBtnEnabled && (
              <button
                onClick={scrollPrev}
                className="absolute left-6 top-[35%] -translate-y-1/2 w-12 h-12 bg-[#FAF8F5] border border-[#E8E4DF] rounded-full shadow-[0_8px_30px_rgba(28,25,23,0.12)] flex items-center justify-center z-10 text-[#1C1917] transition-all hover:bg-[#1C1917] hover:text-[#FAF8F5] opacity-0 group-hover:opacity-100"
                aria-label="Previous slide"
              >
                <ChevronLeft
                  size={32}
                  strokeWidth={1.5}
                  className="ml-[-2px]"
                />
              </button>
            )}

            {nextBtnEnabled && (
              <button
                onClick={scrollNext}
                className="absolute right-6 md top-[35%] -translate-y-1/2 w-12 h-12 bg-[#FAF8F5] border border-[#E8E4DF] rounded-full shadow-[0_8px_30px_rgba(28,25,23,0.12)] flex items-center justify-center z-10 text-[#1C1917] transition-all hover:bg-[#1C1917] hover:text-[#FAF8F5] opacity-0 group-hover:opacity-100"
                aria-label="Next slide"
              >
                <ChevronRight
                  size={32}
                  strokeWidth={1.5}
                  className="mr-[-2px]"
                />
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
