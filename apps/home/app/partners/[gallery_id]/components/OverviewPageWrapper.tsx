"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import useEmblaCarousel from "embla-carousel-react";
import { getOptimizedImage } from "@omenai/shared-lib/storage/getImageFileView";
import { getEventStatus } from "@omenai/shared-utils/src/getEventStatus";
import { getGalleryOverviewData } from "@omenai/shared-services/partners/getGalleryOverviewData";
import { getPromotionalOptimizedImage } from "@omenai/shared-lib/storage/getPromotionalsFileView";
// Fetcher for React Query
const fetchOverview = async (gallery_id: string) => {
  const res = await getGalleryOverviewData(gallery_id);
  if (!res.isOk) throw new Error("Failed to fetch overview");
  return res.data;
};

export default function GalleryOverviewPage({
  galleryId,
}: {
  galleryId: string;
}) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["galleryOverview", galleryId],
    queryFn: () => fetchOverview(galleryId),
    staleTime: 1000 * 60 * 10,
  });

  const [emblaRef] = useEmblaCarousel({ align: "start", dragFree: true });

  const { highlightEvent, historyEvents, status } = useMemo(() => {
    const events = data?.events || [];

    if (events.length === 0) {
      return { highlightEvent: null, historyEvents: [], status: null };
    }

    let active: any[] = [];
    let earliestUpcoming: any = null;
    let latestPast: any = null;

    let earliestUpcomingTime = Infinity;
    let latestPastTime = -Infinity;

    for (const event of events) {
      const startTime = new Date(event.start_date).getTime();
      const status = getEventStatus(event.start_date, event.end_date);

      if (status === "Active") {
        active.push(event);
      } else if (status === "Upcoming") {
        if (startTime < earliestUpcomingTime) {
          earliestUpcomingTime = startTime;
          earliestUpcoming = event;
        }
      } else {
        if (startTime > latestPastTime) {
          latestPastTime = startTime;
          latestPast = event;
        }
      }
    }

    let headliner = null;
    let currentStatus = null;

    if (active.length > 0) {
      headliner = active[0]; // assuming order doesn't matter
      currentStatus = "Active";
    } else if (earliestUpcoming) {
      headliner = earliestUpcoming;
      currentStatus = "Upcoming";
    } else if (latestPast) {
      headliner = latestPast;
      currentStatus = "Closed";
    }

    const historyEvents = headliner
      ? events.filter((e: any) => e.event_id !== headliner.event_id)
      : events;

    return {
      highlightEvent: headliner,
      historyEvents,
      status: currentStatus,
    };
  }, [data]);

  // ✅ Now safe to conditionally return
  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center font-sans text-neutral-400 uppercase tracking-widest text-xs animate-pulse">
        Loading Profile...
      </div>
    );
  }

  if (isError || !data) return null;

  return (
    <div className="w-full pb-32 px-4 md:px-8">
      {/* =========================================
          SECTION 1: THE HIGHLIGHT & BIO BLOCK
      ========================================= */}
      <section className="max-w-[1600px] mx-auto px-4 py-16 md:py-24 border-b border-neutral-100">
        {highlightEvent ? (
          /* ASYMMETRICAL SPLIT (Has Events) */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">
            {/* Left: Highlight Image */}
            <div className="lg:col-span-5">
              <Link
                href={`/events/${highlightEvent.event_id}`}
                className="block group"
              >
                <div className="w-full aspect-[4/3] bg-neutral-100 overflow-hidden rounded-sm relative">
                  <img
                    src={getPromotionalOptimizedImage(
                      highlightEvent.cover_image,
                      "large",
                    )}
                    alt={highlightEvent.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 text-[10px] font-sans font-medium uppercase tracking-[0.2em] text-dark shadow-sm">
                    {status === "Past" ? "Past Show" : "Current Show"}
                  </div>
                </div>
              </Link>
            </div>

            {/* Right: Event Info + Gallery Bio */}
            <div className="lg:col-span-7 flex flex-col justify-center">
              <Link
                href={`/events/${highlightEvent.event_id}`}
                className="group block mb-12"
              >
                <p className="font-sans text-xs text-neutral-500 uppercase tracking-[0.2em] mb-3">
                  {highlightEvent.event_type.replace("_", " ")}
                </p>
                <h2 className="font-serif text-4xl md:text-5xl text-dark leading-tight group-hover:text-neutral-600 transition-colors">
                  {highlightEvent.title}
                </h2>
                <p className="font-sans text-sm text-neutral-500 mt-4">
                  {new Date(highlightEvent.start_date).toLocaleDateString(
                    "en-US",
                    { month: "long", day: "numeric" },
                  )}{" "}
                  —{" "}
                  {new Date(highlightEvent.end_date).toLocaleDateString(
                    "en-US",
                    { month: "long", day: "numeric", year: "numeric" },
                  )}
                </p>
              </Link>

              <div className="w-full h-[1px] bg-neutral-200 mb-12" />

              <div>
                <h3 className="font-sans text-[10px] uppercase tracking-widest text-neutral-400 font-medium mb-6">
                  About the Gallery
                </h3>
                <div className="font-serif text-lg md:text-xl text-neutral-700 leading-relaxed font-light whitespace-pre-wrap">
                  {data.description ||
                    "Information about this gallery will be updated shortly."}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* CENTERED EDITORIAL (No Events) */
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="font-sans text-[10px] uppercase tracking-widest text-neutral-400 font-medium mb-8">
              About the Gallery
            </h3>
            <div className="font-serif text-2xl md:text-3xl text-dark leading-relaxed font-light whitespace-pre-wrap">
              {data.description ||
                "Information about this gallery will be updated shortly."}
            </div>
          </div>
        )}
      </section>

      {/* =========================================
          SECTION 2: EVENT HISTORY CAROUSEL
      ========================================= */}
      {historyEvents.length > 0 && (
        <section className="max-w-[1600px] mx-auto py-20 border-b border-neutral-100 pl-4">
          <div className="pr-4 md:pr-8 lg:pr-12 flex justify-between items-end mb-10">
            <h3 className="font-serif text-3xl font-light text-dark">
              All Shows & Events
            </h3>
            <Link
              href={`/partners/${galleryId}/shows`}
              className="font-sans text-xs uppercase tracking-widest text-dark hover:text-neutral-500 transition-colors border-b border-dark hover:border-neutral-500 pb-1"
            >
              View All
            </Link>
          </div>

          <div
            className="overflow-hidden w-full pr-4 md:pr-8 lg:pr-12"
            ref={emblaRef}
          >
            <div className="flex touch-pan-y space-x-6 md:space-x-8">
              {historyEvents.map((event: any) => (
                <div
                  key={event.event_id}
                  className="flex-[0_0_85%] sm:flex-[0_0_45%] md:flex-[0_0_35%] lg:flex-[0_0_28%] min-w-0 group"
                >
                  <Link
                    href={`/${event.event_type === "exhibition" ? "shows" : "events"}/${event.event_id}`}
                    className="block w-full"
                  >
                    <div className="relative w-full aspect-[3/2] bg-neutral-100 overflow-hidden rounded-sm mb-4">
                      <img
                        src={getPromotionalOptimizedImage(
                          event.cover_image,
                          "medium",
                        )}
                        alt={event.title}
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 grayscale-[20%]"
                      />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-serif text-xl text-dark group-hover:text-neutral-600 transition-colors line-clamp-1">
                        {event.title}
                      </h4>
                      {/* <p className="font-sans text-[11px] text-neutral-400 tracking-wide uppercase pt-1">
                        {event.location.city}, {event.location.country}
                      </p> */}
                      <p className="font-sans text-[11px] text-neutral-400 tracking-wide uppercase pt-1">
                        {new Date(event.start_date).toLocaleDateString(
                          "en-US",
                          { month: "short", day: "numeric" },
                        )}{" "}
                        —{" "}
                        {new Date(event.end_date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* =========================================
          SECTION 3: THE ROSTER
      ========================================= */}
      {(data.represented_artists.length > 0 ||
        data.available_artists.length > 0) && (
        <section className="max-w-[1600px] mx-auto p-4 flex flex-col gap-16">
          {/* Represented Artists */}
          {data.represented_artists.length > 0 && (
            <div>
              <h3 className="font-serif text-2xl font-light text-dark mb-8 italic">
                Represented Artists
              </h3>
              {/* CSS Columns for automatic beautiful listing */}
              <ul className="columns-1 sm:columns-2 md:colums-3 lg:columns-4 xl:columns-6 gap-8 space-y-6 font-sans text-sm text-dark font-medium uppercase tracking-wide">
                {data.represented_artists.map((artist: any) => (
                  <li key={artist.artist_id} className="break-inside-avoid">
                    <Link
                      href={`/partners/${galleryId}/works?artist=${artist.artist_id}`}
                      className="hover:text-neutral-500 hover:underline decoration-neutral-300 underline-offset-4 transition-all"
                    >
                      {artist.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {/* Works Available By */}
          {data.available_artists.length > 0 && (
            <div>
              <h3 className="font-serif text-2xl font-light text-dark mb-8 italic">
                Works Available By
              </h3>
              <ul className="columns-1 sm:columns-2 md:colums-3 lg:columns-4 xl:columns-6 gap-8 space-y-4 font-sans text-sm text-dark font-medium uppercase tracking-wide">
                {data.available_artists.map((artist: any) => (
                  <li key={artist.artist_id} className="break-inside-avoid">
                    <Link
                      href={`/partners/${galleryId}/works?artist=${artist.artist_id}`}
                      className="hover:text-neutral-500 hover:underline decoration-neutral-300 underline-offset-4 transition-all"
                    >
                      {artist.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
