"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getEventStatus } from "@omenai/shared-utils/src/getEventStatus";
import { getGalleryShows } from "@omenai/shared-services/partners/getGalleryShows";
import { GalleryEvent } from "@omenai/shared-types";
import { getPromotionalOptimizedImage } from "@omenai/shared-lib/storage/getPromotionalsFileView";
type FilterType = "All" | "Active" | "Upcoming" | "Past";

const fetchGalleryShows = async ({ pageParam = 1, queryKey }: any) => {
  const [_, galleryId] = queryKey;
  const res = await getGalleryShows(galleryId, pageParam, 12);
  if (!res.isOk) throw new Error("Failed to fetch gallery shows");
  return res;
};

export default function GalleryShowsPage({ galleryId }: { galleryId: string }) {
  const [activeFilter, setActiveFilter] = useState<FilterType>("All");

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["galleryShows", galleryId],
    queryFn: fetchGalleryShows,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage?.pagination) {
        return lastPage.pagination.page < lastPage.pagination.totalPages
          ? lastPage.pagination.page + 1
          : undefined;
      }
      return undefined;
    },
    staleTime: 1000 * 60 * 5,
  });

  // Segregate Headliner and Grid Events
  const { headliner, gridEvents } = useMemo(() => {
    const allShows = data?.pages.flatMap((page) => page?.data || []) || [];

    if (allShows.length === 0) return { headliner: null, gridEvents: [] };

    // 1. Bucket the events
    const active: any[] = [];
    const upcoming: any[] = [];
    const past: any[] = [];

    allShows.forEach((show) => {
      const status = getEventStatus(show.start_date, show.end_date);
      if (status === "Active") active.push(show);
      else if (status === "Upcoming") upcoming.push(show);
      else past.push(show);
    });

    // 2. The backend sorts DESC (newest first).
    // To get the "immediate next" upcoming show, we need the one closest to today,
    // so we temporarily sort the upcoming array ASCENDING.
    const immediateUpcoming = [...upcoming].sort(
      (a, b) =>
        new Date(a.start_date).getTime() - new Date(b.start_date).getTime(),
    );

    let selectedHeadliner: GalleryEvent | null = null;
    let grid = [];

    // 3. Apply the routing logic based on active filter
    if (activeFilter === "All") {
      selectedHeadliner =
        active.length > 0
          ? active[0]
          : immediateUpcoming.length > 0
            ? immediateUpcoming[0]
            : null;
      grid = allShows.filter(
        (show) => show.event_id !== selectedHeadliner?.event_id,
      );
    } else if (activeFilter === "Active") {
      selectedHeadliner = active.length > 0 ? active[0] : null;
      grid = active.filter(
        (show) => show.event_id !== selectedHeadliner?.event_id,
      );
    } else if (activeFilter === "Upcoming") {
      selectedHeadliner =
        immediateUpcoming.length > 0 ? immediateUpcoming[0] : null;
      grid = upcoming.filter(
        (show) => show.event_id !== selectedHeadliner?.event_id,
      );
    } else if (activeFilter === "Past") {
      selectedHeadliner = null;
      grid = past;
    }

    return { headliner: selectedHeadliner, gridEvents: grid };
  }, [data, activeFilter]);

  return (
    <div className="w-full pb-32 pt-12 max-w-[1600px] mx-auto px-4 ">
      {/* 1. FILTER STRIP */}
      <div className="flex gap-8 border-b border-neutral-100 mb-12 overflow-x-auto no-scrollbar">
        {(["All", "Active", "Upcoming", "Past"] as FilterType[]).map(
          (filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`pb-4 font-sans text-[10px] uppercase tracking-widest font-medium transition-colors whitespace-nowrap relative ${
                activeFilter === filter
                  ? "text-dark"
                  : "text-neutral-400 hover:text-neutral-600"
              }`}
            >
              {filter}
              {activeFilter === filter && (
                <span className="absolute bottom-[-1px] left-0 w-full h-[1px] bg-dark" />
              )}
            </button>
          ),
        )}
      </div>

      {isLoading ? (
        <div className="py-32 text-center text-neutral-400 font-sans text-xs uppercase tracking-widest animate-pulse">
          Loading Exhibitions...
        </div>
      ) : isError ? (
        <div className="py-32 text-center text-neutral-400 font-sans text-xs uppercase tracking-widest">
          Failed to load exhibitions.
        </div>
      ) : headliner === null && gridEvents.length === 0 ? (
        <div className="py-32 text-center text-neutral-400 font-sans text-xs uppercase tracking-widest">
          No {activeFilter.toLowerCase()} exhibitions found.
        </div>
      ) : (
        <div className="flex flex-col gap-20">
          {/* 2. THE HEADLINER (Only renders if a headliner exists) */}
          {headliner && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
              {/* Headliner Image (Left) */}
              <div className="lg:col-span-7">
                <Link
                  href={`/${headliner.event_type === "exhibition" ? "shows" : "fairs-events"}/${headliner.event_id}`}
                  className="block group"
                >
                  <div className="w-full aspect-[3/2] bg-neutral-100 overflow-hidden rounded-sm relative shadow-sm border border-neutral-100">
                    <img
                      src={getPromotionalOptimizedImage(
                        headliner.cover_image,
                        "large",
                      )}
                      alt={headliner.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 text-[10px] font-sans font-medium uppercase tracking-[0.2em] text-dark shadow-sm">
                      Featured
                    </div>
                  </div>
                </Link>
              </div>

              {/* Headliner Info (Right) */}
              <div className="lg:col-span-5 flex flex-col justify-center">
                <Link
                  href={`/${headliner.event_type === "exhibition" ? "shows" : "fairs-events"}/${headliner.event_id}`}
                  className="group block"
                >
                  {/* Dynamic Status & Type */}
                  <div className="flex items-center gap-3 mb-4">
                    <span
                      className={`w-2 h-2 rounded-full ${getEventStatus(headliner.start_date, headliner.end_date) === "Active" ? "bg-green-500" : "bg-neutral-400"}`}
                    />
                    <p className="font-sans text-[10px] text-neutral-500 uppercase tracking-[0.2em]">
                      {getEventStatus(headliner.start_date, headliner.end_date)}{" "}
                      {headliner.event_type.replace("_", " ")}
                    </p>
                  </div>

                  {/* Title & Typography */}
                  <h2 className="font-serif text-4xl md:text-5xl text-dark leading-tight group-hover:text-neutral-600 transition-colors mb-6">
                    {headliner.title}
                  </h2>

                  {/* Logistics */}
                  <div className="flex flex-col gap-3 font-sans text-sm text-neutral-500">
                    <p>
                      {new Date(headliner.start_date).toLocaleDateString(
                        "en-US",
                        { month: "long", day: "numeric" },
                      )}{" "}
                      —{" "}
                      {new Date(headliner.end_date).toLocaleDateString(
                        "en-US",
                        { month: "long", day: "numeric", year: "numeric" },
                      )}
                    </p>
                    {headliner.location?.city && (
                      <p className="text-dark/80">
                        {headliner.location.venue
                          ? `${headliner.location.venue}, `
                          : ""}
                        {headliner.location.city}
                      </p>
                    )}
                  </div>
                </Link>
              </div>
            </div>
          )}

          {/* 3. THE 2x2 GRID (The rest of the events) */}
          {gridEvents.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16">
              {gridEvents.map((show: any) => {
                const status = getEventStatus(show.start_date, show.end_date);
                const isClosed = status === "Past";
                const baseRoute =
                  show.event_type === "exhibition" ? "/shows" : "/fairs-events";

                return (
                  <div
                    key={show.event_id}
                    className="group flex flex-col min-w-0"
                  >
                    <Link
                      href={`${baseRoute}/${show.event_id}`}
                      className="block w-full"
                    >
                      <div className="relative w-full aspect-[3/2] bg-neutral-50 overflow-hidden mb-6 rounded-sm border border-neutral-100">
                        <img
                          src={getPromotionalOptimizedImage(
                            show.cover_image,
                            "medium",
                          )}
                          alt={show.title}
                          className={`w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 ${
                            isClosed ? "grayscale-[20%] opacity-90" : ""
                          }`}
                        />
                        <div className="absolute top-4 left-4">
                          <span
                            className={`px-2.5 py-1.5 text-[9px] font-sans uppercase tracking-widest font-medium rounded-sm backdrop-blur-md border ${
                              isClosed
                                ? "bg-black/60 text-white border-black/10"
                                : status === "Upcoming"
                                  ? "bg-white/90 text-neutral-600 border-neutral-200"
                                  : "bg-white/90 text-dark border-neutral-200 shadow-sm"
                            }`}
                          >
                            {status}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col space-y-2 pr-4">
                        <span className="font-sans text-[10px] text-neutral-400 font-medium tracking-[0.2em] uppercase">
                          {show.event_type.replace("_", " ")}
                        </span>
                        {/* Enlarged typography since these cards are 50% width now */}
                        <h3 className="font-serif text-2xl md:text-3xl text-dark leading-tight line-clamp-2 group-hover:text-neutral-600 transition-colors">
                          {show.title}
                        </h3>
                        <p className="font-sans text-xs text-neutral-500 tracking-wide uppercase pt-1">
                          {new Date(show.start_date).toLocaleDateString(
                            "en-US",
                            { month: "short", day: "numeric" },
                          )}{" "}
                          —{" "}
                          {new Date(show.end_date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 4. PAGINATION LOAD MORE */}
      {hasNextPage && (
        <div className="mt-20 flex justify-center border-t border-neutral-100 pt-12">
          <button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="font-sans text-xs uppercase tracking-widest font-medium text-dark border border-neutral-200 px-10 py-4 hover:border-dark hover:bg-neutral-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded-sm"
          >
            {isFetchingNextPage ? "Loading..." : "Load More Shows"}
          </button>
        </div>
      )}
    </div>
  );
}
