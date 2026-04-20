// app/fairs-events/[event_id]/FairEventDetailsClient.tsx
"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { FairEventHero } from "./FairEventHero";
import ArtworkCard from "@omenai/shared-ui-components/components/artworks/ArtworkCard";
import useEmblaCarousel from "embla-carousel-react";
import { getOptimizedImage } from "@omenai/shared-lib/storage/getImageFileView";
import Link from "next/link";
import { FairEventInfo } from "./FairEventInfo";
import MasonryGrid from "@omenai/shared-ui-components/components/artworks/MasonryGrid";
type FilterValue = "All" | "Available" | "Sold";

export const FairEventDetailsClient = ({ event }: { event: any }) => {
  // STATE: Filters & Immersive View
  const [activeFilter, setActiveFilter] = useState<
    "All" | "Available" | "Sold"
  >("All");
  const [isImmersiveOpen, setIsImmersiveOpen] = useState(false);

  // Immersive Embla Carousel Hook
  const [immersiveRef, immersiveApi] = useEmblaCarousel({
    loop: true,
    align: "center",
  });

  const filteredArtworks = useMemo(() => {
    if (!event.artworks) return [];
    if (activeFilter === "All") return event.artworks;
    return event.artworks.filter((art: any) =>
      activeFilter === "Available" ? art.availability : !art.availability,
    );
  }, [event.artworks, activeFilter]);

  // Handle Immersive View Keyboard Navigation
  const scrollPrev = useCallback(
    () => immersiveApi && immersiveApi.scrollPrev(),
    [immersiveApi],
  );
  const scrollNext = useCallback(
    () => immersiveApi && immersiveApi.scrollNext(),
    [immersiveApi],
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isImmersiveOpen) return;
      if (e.key === "Escape") setIsImmersiveOpen(false);
      if (e.key === "ArrowLeft") scrollPrev();
      if (e.key === "ArrowRight") scrollNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isImmersiveOpen, scrollPrev, scrollNext]);

  // Lock body scroll when immersive view is open
  useEffect(() => {
    if (isImmersiveOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isImmersiveOpen]);

  const FILTERS: FilterValue[] = ["All", "Available", "Sold"];

  return (
    <>
      <main className="min-h-screen bg-white pb-32">
        {/* 1. Hero — unchanged, owned by FairEventHero */}
        <FairEventHero event={event} />

        {/* 2. Event info + editorial description */}
        <FairEventInfo event={event} />

        {/* ARTWORK GRID SECTION */}
        <section className="max-w-[1600px] mx-auto px-6 md:px-8 lg:px-12 pt-20 border-t border-neutral-100">
          {/* ── Section header ── */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-t border-black pt-8 mb-14">
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <span className="text-[10px] uppercase tracking-[0.3em] font-semibold font-sans text-black">
                  Exhibition
                </span>
                <h2 className="font-serif text-[clamp(1.8rem,4vw,3rem)] font-light text-black leading-tight">
                  Featured Works
                </h2>
              </div>

              {/* Filter pills */}
              <div className="flex items-center gap-1.5">
                {FILTERS.map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`px-3 py-1.5 text-[10px] uppercase tracking-[0.15em] font-medium font-sans border transition-all duration-150 ${
                      activeFilter === filter
                        ? "border-black bg-black text-white"
                        : "border-neutral-300 text-neutral-600 hover:border-black hover:text-black bg-white"
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            {/* Right: count + immersive toggle */}
            <div className="flex items-end gap-8 pb-1">
              {/* Work count */}
              <div className="flex items-baseline gap-1.5">
                <span className="font-serif text-2xl font-light text-black">
                  {filteredArtworks.length}
                </span>
                {activeFilter !== "All" && (
                  <>
                    <span className="text-neutral-300 text-sm font-sans">
                      /
                    </span>
                    <span className="text-sm font-sans font-light text-neutral-500">
                      {event.artworks?.length}
                    </span>
                  </>
                )}
                <span className="text-[10px] uppercase tracking-widest font-sans text-neutral-400 ml-1">
                  {filteredArtworks.length === 1 ? "Work" : "Works"}
                </span>
              </div>

              {/* Immersive toggle */}
              {filteredArtworks.length > 0 && (
                <button
                  onClick={() => setIsImmersiveOpen((v) => !v)}
                  className={`group flex items-center gap-2 transition-colors duration-150 ${
                    isImmersiveOpen
                      ? "text-black"
                      : "text-neutral-500 hover:text-black"
                  }`}
                >
                  {/* 2×2 grid icon */}
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    className="transition-colors"
                  >
                    <rect
                      x="0"
                      y="0"
                      width="5"
                      height="5"
                      fill="currentColor"
                    />
                    <rect
                      x="7"
                      y="0"
                      width="5"
                      height="5"
                      fill="currentColor"
                    />
                    <rect
                      x="0"
                      y="7"
                      width="5"
                      height="5"
                      fill="currentColor"
                    />
                    <rect
                      x="7"
                      y="7"
                      width="5"
                      height="5"
                      fill="currentColor"
                    />
                  </svg>
                  <span className="text-[10px] uppercase tracking-[0.25em] font-medium font-sans">
                    {isImmersiveOpen ? "Close Immersive" : "Immersive View"}
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* MASONRY GRID (CSS Columns) */}
          <MasonryGrid>
            {filteredArtworks.map((art: any) => (
              // break-inside-avoid prevents a card from splitting across two columns
              <div key={art.art_id} className="break-inside-avoid">
                <ArtworkCard
                  image={art.url}
                  name={art.title}
                  artist={art.artist}
                  art_id={art.art_id}
                  pricing={art.pricing}
                  impressions={art.impressions || 0}
                  likeIds={art.like_IDs || []}
                  sessionId={undefined}
                  availability={art.availability}
                  medium={art.medium}
                  author_id={art.author_id}
                  //   isMasonry={true}
                />
              </div>
            ))}
          </MasonryGrid>

          {filteredArtworks.length === 0 && (
            <div className="py-20 text-center font-sans text-xs uppercase tracking-widest text-neutral-400">
              No {activeFilter.toLowerCase()} artworks found.
            </div>
          )}
        </section>
      </main>

      {/* IMMERSIVE VIEW MODAL */}
      {isImmersiveOpen && (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col">
          {/* Top Bar */}
          <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-50">
            <span className="font-sans text-[10px] font-medium text-dark uppercase tracking-[0.2em]">
              {event.title} — {filteredArtworks.length} Works
            </span>
            <button
              onClick={() => setIsImmersiveOpen(false)}
              className="text-dark hover:text-dark transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Immersive Embla Carousel */}
          <div className="flex-1 w-full h-full relative" ref={immersiveRef}>
            <div className="flex h-full w-full">
              {filteredArtworks.map((art: any) => (
                <Link
                  href={`/artwork/${art.art_id}`}
                  key={art.art_id}
                  className="cursor-pointer flex-[0_0_100%] min-w-0 h-full flex flex-col justify-center items-center p-8 md:p-16 relative"
                >
                  <img
                    src={getOptimizedImage(art.url, "medium")}
                    alt={art.title}
                    className="max-w-full max-h-[75vh] object-contain shadow-2xl"
                  />

                  {/* Floating Metadata */}
                  <div className="absolute bottom-8 left-8 md:bottom-12 md:left-12 flex flex-col gap-1 text-dark">
                    <p className="font-sans text-xs uppercase tracking-widest text-dark/60">
                      {art.artist}
                    </p>
                    <h3 className="font-serif text-xl md:text-2xl font-light italic break-words max-w-[400px]">
                      {art.title}, {art.year}
                    </h3>
                    <p className="font-sans text-[10px] uppercase tracking-widest text-dark/60 mt-1">
                      {art.medium}
                    </p>
                    <p className="font-sans text-[10px] uppercase tracking-widest text-dark/60 mt-1">
                      {event.gallery.name}{" "}
                      {event.event_type === "art_fair" &&
                        " — " + event.location.country}{" "}
                      {}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Immersive Navigation */}
          <button
            onClick={scrollPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-4 text-dark/50 hover:text-dark transition-colors z-50"
          >
            <svg
              className="w-8 h-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <button
            onClick={scrollNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-4 text-dark/50 hover:text-dark transition-colors z-50"
          >
            <svg
              className="w-8 h-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      )}
    </>
  );
};
