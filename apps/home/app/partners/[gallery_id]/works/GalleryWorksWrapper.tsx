// app/gallery/[gallery_id]/works/page.tsx
"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import useEmblaCarousel from "embla-carousel-react";
import ArtworkCard from "@omenai/shared-ui-components/components/artworks/ArtworkCard";
import { getOptimizedImage } from "@omenai/shared-lib/storage/getImageFileView";
import { getGalleryWorks } from "@omenai/shared-services/events/getGalleryWorks";
import Link from "next/link";
import { formatPrice } from "@omenai/shared-utils/src/priceFormatter";
import MasonryGrid from "@omenai/shared-ui-components/components/artworks/MasonryGrid";

const fetchWorks = async ({ pageParam = 1, queryKey }: any) => {
  const [_, galleryId, filters] = queryKey;
  const queryParams = new URLSearchParams({
    page: pageParam.toString(),
    id: galleryId,
    limit: "20",
    ...(filters.medium &&
      filters.medium !== "All" && { medium: filters.medium }),
    ...(filters.price && filters.price !== "All" && { price: filters.price }),
  });

  const res = await getGalleryWorks(queryParams);
  if (!res.isOk) throw new Error("Failed to fetch works");
  return res;
};

// Quick fetcher to grab the artist names for the dropdown filter
const fetchGalleryArtists = async (galleryId: string) => {
  const res = await fetch(`/api/public/galleries/${galleryId}/overview`);
  if (!res.ok) return [];
  const data = await res.json();
  // Combine both arrays and deduplicate just in case
  const combined = [...(data.represented_artists || [])];
  return Array.from(
    new Map(combined.map((item) => [item.artist_id, item])).values(),
  );
};

export default function GalleryWorksPage({ galleryId }: { galleryId: string }) {
  const searchParams = useSearchParams();

  // Grab the artist ID from the URL if the user clicked a name on the Overview tab
  const artistParam = searchParams.get("artist");

  // States for UI Filters and Immersive View
  const [artistFilter, setArtistFilter] = useState(artistParam || "All");
  const [mediumFilter, setMediumFilter] = useState("All");
  const [priceFilter, setPriceFilter] = useState("All");
  const [isImmersiveOpen, setIsImmersiveOpen] = useState(false);

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: [
      "galleryWorks",
      galleryId,
      { artist: artistFilter, medium: mediumFilter, price: priceFilter },
    ],
    queryFn: fetchWorks,
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage?.pagination) {
        return lastPage.pagination.page < lastPage.pagination.totalPages
          ? lastPage.pagination.page + 1
          : undefined;
      }
      return undefined;
    },
    staleTime: 1000 * 60 * 5,
  });

  const allArtworks = useMemo(() => {
    return data?.pages.flatMap((page) => page?.data || []) || [];
  }, [data]);

  // Immersive Embla Carousel Hook
  const [immersiveRef, immersiveApi] = useEmblaCarousel({
    loop: true,
    align: "center",
  });

  const scrollPrev = useCallback(
    () => immersiveApi && immersiveApi.scrollPrev(),
    [immersiveApi],
  );
  const scrollNext = useCallback(
    () => immersiveApi && immersiveApi.scrollNext(),
    [immersiveApi],
  );

  // Keyboard Navigation & Scroll Lock for Immersive View
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isImmersiveOpen) return;
      if (e.key === "Escape") setIsImmersiveOpen(false);
      if (e.key === "ArrowLeft") scrollPrev();
      if (e.key === "ArrowRight") scrollNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = isImmersiveOpen ? "hidden" : "auto";
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [isImmersiveOpen, scrollPrev, scrollNext]);

  // Sync state if URL changes
  useEffect(() => {
    if (artistParam) setArtistFilter(artistParam);
  }, [artistParam]);

  return (
    <div className="w-full pb-32 pt-12 max-w-[1600px] mx-auto px-4 ">
      {/* 1. FILTER STRIP & IMMERSIVE TOGGLE */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 border-b border-neutral-100 pb-6">
        {/* Left: Native Select Filters */}
        <div className="flex flex-wrap gap-4">
          {/* Medium Filter */}
          <select
            value={mediumFilter}
            onChange={(e) => setMediumFilter(e.target.value)}
            className="font-sans text-[11px] uppercase tracking-widest text-dark bg-white border border-neutral-200 px-4 py-2.5 rounded-sm outline-none focus:ring-0 focus:outline-none focus:border-dark transition-colors appearance-none pr-10 bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23131313%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:8px_8px] bg-no-repeat bg-[position:right_12px_center]"
          >
            <option value="All">Medium</option>
            <option value="Photography">Photography</option>
            <option value="Works on paper">Works on paper</option>
            <option value="Acrylic on canvas/linen/panel">
              Acrylic on canvas/linen/panel
            </option>
            <option value="Mixed media on canvas">Mixed media on canvas</option>
            <option value="Oil on canvas/panel">Oil on canvas/panel</option>
          </select>

          {/* Price Range Filter */}
          <select
            value={priceFilter}
            onChange={(e) => setPriceFilter(e.target.value)}
            className="font-sans text-[11px] uppercase tracking-widest text-dark bg-white border border-neutral-200 px-4 py-2.5 rounded-sm outline-none focus:ring-0 focus:outline-none focus:border-dark transition-colors appearance-none pr-10 bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23131313%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:8px_8px] bg-no-repeat bg-[position:right_12px_center]"
          >
            <option value="All">All Prices</option>
            <option value="Under 1000">Under $1,000</option>
            <option value="1000-5000">$1,000 - $5,000</option>
            <option value="5000-10000">$5,000 - $10,000</option>
            <option value="Over 10000">Over $10,000</option>
          </select>
        </div>

        {/* Right: Immersive View Button */}
        {allArtworks.length > 0 && (
          <button
            onClick={() => setIsImmersiveOpen(true)}
            className="flex items-center gap-2 font-sans text-xs uppercase tracking-widest font-medium text-dark hover:text-neutral-500 transition-colors group self-start md:self-auto"
          >
            <svg
              className="w-4 h-4 transition-transform group-hover:scale-110"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
              />
            </svg>
            Immersive View
          </button>
        )}
      </div>

      {/* 2. THE MASONRY GRID */}
      {isLoading ? (
        <div className="py-32 text-center text-neutral-400 font-sans text-xs uppercase tracking-widest animate-pulse">
          Loading Artworks...
        </div>
      ) : isError ? (
        <div className="py-32 text-center text-neutral-400 font-sans text-xs uppercase tracking-widest">
          Failed to load artworks.
        </div>
      ) : allArtworks.length === 0 ? (
        <div className="py-32 text-center text-neutral-400 font-sans text-xs uppercase tracking-widest">
          No artworks found matching your criteria.
        </div>
      ) : (
        <>
          <p className="text-[11px] text-neutral-500 my-5">
            {allArtworks.length} works
          </p>
          <MasonryGrid>
            {allArtworks.map((art: any) => (
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
                />
              </div>
            ))}
          </MasonryGrid>

          {/* 3. PAGINATION LOAD MORE */}
          {hasNextPage && (
            <div className="mt-20 flex justify-center border-t border-neutral-100 pt-12">
              <button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="font-sans text-xs uppercase tracking-widest font-medium text-dark border border-neutral-200 px-10 py-4 hover:border-dark hover:bg-neutral-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded-sm"
              >
                {isFetchingNextPage ? "Loading..." : "Load More Works"}
              </button>
            </div>
          )}
        </>
      )}

      {/* 4. IMMERSIVE VIEW MODAL */}
      {isImmersiveOpen && (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col">
          {/* Top Bar */}
          <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-50">
            <span className="font-sans text-[10px] font-medium text-dark uppercase tracking-[0.2em]">
              Works — {allArtworks.length} Works
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
              {allArtworks.map((art: any) => (
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
                      {art.availability
                        ? formatPrice(art.pricing.usd_price)
                        : "Sold"}
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
    </div>
  );
}
