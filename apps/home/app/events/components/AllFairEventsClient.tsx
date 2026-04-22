// app/fairs-events/AllFairsEventsClient.tsx
"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getOptimizedImage } from "@omenai/shared-lib/storage/getImageFileView";
import { getAllEvents } from "@omenai/shared-services/events/getAllEvents";
import { getEventStatus } from "@omenai/shared-utils/src/getEventStatus";
import { AllFairsEventsSkeleton } from "./AllFairEventsSkeleton";
import { getPromotionalOptimizedImage } from "@omenai/shared-lib/storage/getPromotionalsFileView";

// FETCHER UPDATE: Accept pageParam from React Query
const fetchAllFairsEvents = async ({ pageParam = 1 }) => {
  const res = await getAllEvents(pageParam.toString(), "20", "all");
  if (!res.isOk) throw new Error("Failed to fetch events");
  return res;
};

export const AllFairsEventsClient = () => {
  // QUERY UPDATE: useInfiniteQuery setup
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["allFairsEvents"],
    queryFn: fetchAllFairsEvents,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      // Use the metadata we built into the backend to determine if there's a next page
      if (lastPage.pagination.page < lastPage.pagination.totalPages) {
        return lastPage.pagination.page + 1;
      }
      return undefined;
    },
    staleTime: 1000 * 60 * 5,
  });

  // SEGREGATION UPDATE: Flatten the pages array before bucketing
  const { currentEvents, pastEvents, upcomingEvents } = useMemo(() => {
    if (!data?.pages)
      return { currentEvents: [], pastEvents: [], upcomingEvents: [] };

    const current: any[] = [];
    const past: any[] = [];
    const upcoming: any[] = [];

    // Flatten all fetched pages into a single array
    const allEvents = data.pages.flatMap((page) => page.data);

    allEvents.forEach((event: any) => {
      const status = getEventStatus(event.start_date, event.end_date);
      if (status === "Active") current.push(event);
      else if (status === "Past") past.push(event);
      else upcoming.push(event);
    });

    return {
      currentEvents: current,
      pastEvents: past,
      upcomingEvents: upcoming,
    };
  }, [data]);

  if (isLoading) return <AllFairsEventsSkeleton />;
  if (isError)
    return (
      <div className="py-20 text-center font-sans text-neutral-500">
        Failed to load events.
      </div>
    );

  return (
    <div className="w-full pb-32">
      {/* 1. CURRENTLY RUNNING EVENTS (2-Column Grid) */}
      {currentEvents.length > 0 && (
        <section className="mb-24">
          {/* <h2 className="font-serif text-3xl md:text-4xl text-dark mb-10 font-light">
            Current Events
          </h2> */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {currentEvents.map((event) => (
              <Link
                href={`/events/${event.event_id}`}
                key={event.event_id}
                className="group block"
              >
                <div className="w-full aspect-[3/2] overflow-hidden rounded-sm bg-neutral-100 mb-4">
                  <img
                    src={getPromotionalOptimizedImage(
                      event.cover_image,
                      "medium",
                    )}
                    alt={event.title}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                </div>
                <div className="space-y-1">
                  <p className="font-sans text-[11px] uppercase tracking-widest text-neutral-500 font-medium">
                    {event.gallery?.name}
                  </p>
                  <h3 className="font-serif text-2xl text-dark group-hover:text-neutral-600 transition-colors">
                    {event.title}
                  </h3>
                  <p className="font-sans text-xs text-neutral-400 pt-1">
                    {new Date(event.start_date).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                    })}{" "}
                    —{" "}
                    {new Date(event.end_date).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 2. PAST & UPCOMING SPLIT */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">
        {/* LEFT COLUMN: Past Events */}
        <div className="lg:col-span-8 flex flex-col">
          <h2 className="font-serif text-3xl text-dark mb-8 font-light">
            Past Events
          </h2>

          <div className="flex flex-col border-t border-neutral-200">
            {pastEvents.length === 0 ? (
              <p className="py-8 font-sans text-sm text-neutral-400">
                No past events found.
              </p>
            ) : (
              pastEvents.map((event) => (
                <Link
                  href={`/fairs-events/${event.event_id}`}
                  key={event.event_id}
                  className="group flex items-center py-6 border-b border-neutral-200 hover:bg-neutral-50/50 transition-colors pr-4"
                >
                  <div className="w-16 h-16 md:w-20 md:h-20 shrink-0 bg-dark overflow-hidden rounded-sm">
                    <img
                      src={getPromotionalOptimizedImage(
                        event.cover_image,
                        "small",
                      )}
                      alt={event.title}
                      className="w-full h-full object-cover grayscale-[20%]"
                    />
                  </div>

                  <div className="ml-6 flex-1 min-w-0">
                    <h3 className="font-sans text-base md:text-lg text-dark font-medium truncate group-hover:underline decoration-neutral-300 underline-offset-4">
                      {event.title}
                    </h3>
                    <p className="font-sans text-sm text-neutral-500 truncate mt-0.5">
                      {event.gallery?.name}
                    </p>
                  </div>

                  <div className="hidden sm:flex items-center ml-4 shrink-0 gap-6">
                    <p className="font-sans text-sm text-neutral-500 whitespace-nowrap">
                      {new Date(event.start_date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}{" "}
                      —{" "}
                      {new Date(event.end_date).toLocaleDateString("en-US", {
                        year: "numeric",
                      })}
                    </p>
                    <svg
                      className="w-5 h-5 text-neutral-300 group-hover:text-dark transition-colors"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </Link>
              ))
            )}
          </div>

          {/* PAGINATION BUTTON: Placed under the past events list */}
          {hasNextPage && (
            <div className="mt-8 flex justify-center">
              <button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="font-sans text-xs uppercase tracking-widest font-medium text-dark border border-neutral-200 px-8 py-3 rounded-sm hover:border-dark hover:bg-neutral-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isFetchingNextPage ? "Loading..." : "Load More Past Events"}
              </button>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Upcoming Events */}
        <div className="lg:col-span-4">
          <h2 className="font-serif text-3xl text-dark mb-8 font-light">
            Upcoming Events
          </h2>

          <div className="flex flex-col border-t border-neutral-200">
            {upcomingEvents.length === 0 ? (
              <p className="py-8 font-sans text-sm text-neutral-400">
                No upcoming events currently scheduled.
              </p>
            ) : (
              upcomingEvents.map((event) => (
                <div
                  key={event.event_id}
                  className="py-6 border-b border-neutral-100 last:border-0"
                >
                  <Link
                    href={`/fairs-events/${event.event_id}`}
                    className="group flex flex-col"
                  >
                    <h3 className="font-sans text-base text-dark underline decoration-neutral-300 underline-offset-4 hover:decoration-dark transition-colors leading-snug">
                      {event.title}
                    </h3>
                    <p className="font-sans text-sm text-neutral-500 mt-2">
                      {new Date(event.start_date).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                      })}{" "}
                      —{" "}
                      {new Date(event.end_date).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
