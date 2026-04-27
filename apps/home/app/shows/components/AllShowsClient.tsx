"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getOptimizedImage } from "@omenai/shared-lib/storage/getImageFileView";
import { getEventStatus } from "@omenai/shared-utils/src/getEventStatus";
import { AllShowsSkeleton } from "./AllShowsSkeleton";
import { getAllShows } from "@omenai/shared-services/events/getAllShows";
import { getPromotionalOptimizedImage } from "@omenai/shared-lib/storage/getPromotionalsFileView";
const fetchAllShows = async () => {
  const response = await getAllShows();
  if (!response.isOk) throw new Error("Failed to fetch shows");
  return response.data;
};

type FilterType = "All" | "Active" | "Upcoming" | "Closed";

export const AllShowsClient = () => {
  const [activeFilter, setActiveFilter] = useState<FilterType>("All");

  const {
    data: shows,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["allShows"],
    queryFn: fetchAllShows,
    staleTime: 1000 * 60 * 5,
  });

  // Client-side filtering makes tab switching instant
  const filteredShows = useMemo(() => {
    if (!shows) return [];
    if (activeFilter === "All") return shows;

    return shows.filter((show: any) => {
      const status = getEventStatus(show.start_date, show.end_date);
      return status === activeFilter;
    });
  }, [shows, activeFilter]);

  if (isError) {
    return (
      <div className="py-32 text-center text-neutral-500 font-light">
        Failed to load exhibitions. Please refresh the page.
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Page Header */}
      <div className="mb-12">
        <h1 className="text-2xl md:text-3xl font-light font-serif text-dark mb-4">
          Exhibitions
        </h1>
        <p className="text-sm text-neutral-500 font-light max-w-2xl">
          Discover current, upcoming, and past gallery presentations from our
          global of dealers.
        </p>
      </div>

      {isLoading ? (
        <AllShowsSkeleton />
      ) : (
        <>
          {/* Minimalist Editorial Filter Strip */}
          <div className="flex gap-8 border-b border-neutral-200 mb-10 overflow-x-auto no-scrollbar">
            {(["All", "Active", "Upcoming", "Closed"] as FilterType[]).map(
              (filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`pb-4 text-xs uppercase tracking-widest font-medium transition-colors whitespace-nowrap relative ${
                    activeFilter === filter
                      ? "text-dark"
                      : "text-neutral-400 hover:text-neutral-600"
                  }`}
                >
                  {filter}
                  {/* Active Underline indicator */}
                  {activeFilter === filter && (
                    <span className="absolute bottom-[-1px] left-0 w-full h-[1px] bg-dark" />
                  )}
                </button>
              ),
            )}
          </div>

          {/* The Grid */}
          {filteredShows.length === 0 ? (
            <div className="py-20 text-center text-neutral-400 text-sm font-light">
              No {activeFilter.toLowerCase()} exhibitions found at this time.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-12">
              {filteredShows.map((show: any) => {
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
                        <h3 className="font-serif text-lg md:text-xl font-normal text-black leading-snug line-clamp-2 group-hover/card:text-neutral-500 transition-colors">
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
          )}
        </>
      )}
    </div>
  );
};
