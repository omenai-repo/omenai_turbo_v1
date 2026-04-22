"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import ArtworkCard from "@omenai/shared-ui-components/components/artworks/ArtworkCard";
import { getGalleryArtists } from "@omenai/shared-services/partners/getGalleryArtists";
import { getGalleryOverviewData } from "@omenai/shared-services/partners/getGalleryOverviewData";
import { ArtistRow } from "./ArtistRow";
const fetchGalleryArtistsIndex = async (galleryId: string) => {
  const res = await getGalleryOverviewData(galleryId);
  if (!res.isOk) throw new Error("Failed to fetch artist index");
  return res.data;
};

// Fetches the heavy paginated chunks of artists WITH their artworks
const fetchPaginatedArtists = async ({ pageParam = 1, queryKey }: any) => {
  const [_, galleryId, selectedArtist] = queryKey;

  const res = await getGalleryArtists(
    galleryId,
    pageParam,
    10,
    `${selectedArtist && selectedArtist}`,
  );
  if (!res.isOk) throw new Error("Failed to fetch artist chunk");
  return res;
};

export default function GalleryArtistsPage({
  galleryId,
}: {
  galleryId: string;
}) {
  const [selectedArtist, setSelectedArtist] = useState<string | null>(null);

  // 1. Fetch the Index
  const { data: indexData, isLoading: isIndexLoading } = useQuery({
    queryKey: ["galleryArtistsIndex", galleryId],
    queryFn: () => fetchGalleryArtistsIndex(galleryId),
    staleTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });

  // 2. Fetch the Paginated Gallery Floor
  const {
    data: floorData,
    isLoading: isFloorLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["galleryArtistsFloor", galleryId, selectedArtist],
    queryFn: fetchPaginatedArtists,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (
        lastPage?.pagination &&
        lastPage.pagination.page < lastPage.pagination.totalPages
      ) {
        return lastPage.pagination.page + 1;
      }
      return undefined;
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  const paginatedArtists = useMemo(() => {
    return floorData?.pages.flatMap((page) => page?.data || []) || [];
  }, [floorData]);

  // Handle smooth scroll when an index link is clicked
  useEffect(() => {
    if (selectedArtist) {
      setTimeout(() => {
        document
          .getElementById("artist-floor")
          ?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [selectedArtist]);

  if (isIndexLoading) {
    return (
      <div className="py-32 text-center text-neutral-400 font-sans text-xs uppercase tracking-widest animate-pulse">
        Loading Artists...
      </div>
    );
  }

  const represented = indexData?.represented_artists || [];
  const available = indexData?.available_artists || [];

  return (
    <div className="w-full pb-32">
      {/* SECTION 1: THE INDEX */}
      <section className="bg-neutral-50/50 border-b border-neutral-100 py-8">
        <div className="max-w-[1600px] mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24">
          {represented.length > 0 && (
            <div>
              <h2 className="font-serif text-xl font-light text-dark mb-10 italic">
                Represented Artists
              </h2>
              <ul className="columns-1 sm:columns-2 gap-8 space-y-5 font-sans text-sm text-dark font-medium uppercase tracking-wide">
                {represented.map((artist: any) => (
                  <li
                    key={`index-${artist.artist_id}`}
                    className="break-inside-avoid"
                  >
                    <a
                      href="#artist-floor"
                      onClick={(e) => {
                        e.preventDefault();
                        setSelectedArtist(artist.artist_id);
                      }}
                      className={`hover:text-neutral-500 hover:underline decoration-neutral-300 underline-offset-4 transition-all ${
                        selectedArtist === artist.artist_id
                          ? "text-neutral-500 underline"
                          : ""
                      }`}
                    >
                      {artist.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {available.length > 0 && (
            <div>
              <h2 className="font-serif text-xl font-light text-dark mb-10 italic">
                Works Available By
              </h2>
              <ul className="columns-1 sm:columns-2 gap-8 space-y-5 font-sans text-sm text-dark font-medium uppercase tracking-wide">
                {available.map((artist: any) => (
                  <li
                    key={`index-${artist.artist_id}`}
                    className="break-inside-avoid"
                  >
                    <a
                      href="#artist-floor"
                      onClick={(e) => {
                        e.preventDefault();
                        setSelectedArtist(artist.artist_id);
                      }}
                      className={`hover:text-neutral-500 hover:underline decoration-neutral-300 underline-offset-4 transition-all ${
                        selectedArtist === artist.artist_id
                          ? "text-neutral-500 underline"
                          : ""
                      }`}
                    >
                      {artist.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      {/* SECTION 2: THE GALLERY FLOOR */}
      <section
        id="artist-floor"
        className="max-w-[1600px] mx-auto pl-4 md:pl-8 lg:pl-12 pt-12 scroll-mt-32"
      >
        {selectedArtist && (
          <div className="mb-8 pr-4 md:pr-8 lg:pr-12">
            <button
              onClick={() => setSelectedArtist(null)}
              className="group flex items-center gap-2 font-sans text-[10px] uppercase tracking-widest font-medium text-neutral-400 hover:text-dark transition-colors border border-neutral-200 hover:border-dark px-4 py-2.5 rounded-sm"
            >
              <svg
                className="w-4 h-4 transition-transform group-hover:-translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              View Full Gallery Roster
            </button>
          </div>
        )}

        {isFloorLoading ? (
          <div className="py-32 flex justify-center items-center pr-4 md:pr-8 lg:pr-12">
            <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-neutral-400 animate-pulse">
              Loading Gallery Floor...
            </span>
          </div>
        ) : (
          paginatedArtists.map((artist: any) => {
            if (!selectedArtist && artist.totalWorks === 0) return null;

            return (
              <ArtistRow
                key={artist.artist_id}
                artist={artist}
                galleryId={galleryId}
              />
            );
          })
        )}

        {/* Server Pagination Trigger */}
        {!selectedArtist && hasNextPage && (
          <div className="py-20 flex justify-center items-center pr-4 md:pr-8 lg:pr-12 border-t border-neutral-100">
            <button
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="font-sans text-xs uppercase tracking-widest font-medium text-dark border border-neutral-200 px-10 py-4 hover:border-dark hover:bg-neutral-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded-sm"
            >
              {isFetchingNextPage
                ? "Loading More Artists..."
                : "Load More Artists"}
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

// 4. The Dumb Row Component (No fetching, just rendering)
