"use client";

import { useQuery } from "@tanstack/react-query";
import { useWindowSize } from "usehooks-ts";
import Pagination from "@omenai/shared-ui-components/components/pagination/Pagination";
import { fetchArtworksByCriteria } from "@omenai/shared-services/artworks/fetchArtworksByCriteria";
import { collectionsFilterStore } from "@omenai/shared-state-store/src/collections/collectionsFilterStore";
import { collectionsStore } from "@omenai/shared-state-store/src/collections/collectionsStore";
import { ArtworksListingSkeletonLoader } from "@omenai/shared-ui-components/components/loader/ArtworksListingSkeletonLoader";
import NotFoundData from "@omenai/shared-ui-components/components/notFound/NotFoundData";
import { catalogChunk } from "@omenai/shared-utils/src/createCatalogChunks";
import ArtworkCard from "@omenai/shared-ui-components/components/artworks/ArtworkCard";
import { useEffect } from "react";

export function ArtworksListing({
  medium,
  sessionId,
}: {
  medium: string;
  sessionId: string | undefined;
}) {
  const {
    setArtworks,
    artworks,
    currentPage,
    setCurrentPage,
    setIsLoading,
    artwork_total,
    set_artwork_total,
    pageCount,
    setPageCount,
  } = collectionsStore();
  const { filterOptions } = collectionsFilterStore();
  const { width } = useWindowSize();

  const { data: artworksArray, isLoading: loading } = useQuery({
    queryKey: ["get_artworks_by_collection", medium, currentPage], // Added currentPage to key
    queryFn: async () => {
      const response = await fetchArtworksByCriteria(
        currentPage,
        filterOptions,
        medium
      );

      if (response?.data) {
        set_artwork_total(response.total);
        setArtworks(response.data);
        setPageCount(response.pageCount);
        return { data: response.data, pages: response.pageCount };
      } else throw new Error("Failed to fetch artworks");
    },
    refetchOnWindowFocus: false,
    staleTime: 0,
  });

  // Reset page when medium changes
  useEffect(() => {
    setCurrentPage(1);
  }, [medium, setCurrentPage]);

  if (loading) {
    return <ArtworksListingSkeletonLoader />;
  }

  if (!artworks || artworks.length === 0) {
    return (
      <div className="flex h-[50vh] w-full flex-col items-center justify-center border border-dashed border-neutral-200">
        <NotFoundData />
        <span className="mt-4 font-mono text-xs text-neutral-400">
          No works found in this collection.
        </span>
      </div>
    );
  }

  const arts = catalogChunk(
    artworks,
    width <= 640 ? 1 : width <= 990 ? 2 : width <= 1440 ? 3 : 4
  );

  return (
    <div className="w-full">
      {/* Count Indicator */}
      <div className="mb-8 flex items-center gap-2">
        <div className="h-1.5 w-1.5 bg-dark rounded"></div>
        <span className="font-mono text-xs uppercase tracking-widest text-neutral-500">
          {artwork_total} Works Available
        </span>
      </div>

      {/* The Grid */}
      <div className="flex flex-wrap justify-center gap-x-8">
        {arts.map((column: any[], colIndex) => {
          return (
            <div className="flex flex-1 flex-col gap-12" key={colIndex}>
              {column.map((art: any) => {
                return (
                  <ArtworkCard
                    key={art.art_id}
                    image={art.url}
                    name={art.title}
                    artist={art.artist}
                    art_id={art.art_id}
                    pricing={art.pricing}
                    impressions={art.impressions as number}
                    likeIds={art.like_IDs as string[]}
                    sessionId={sessionId}
                    availability={art.availability}
                    medium={art.medium}
                    author_id={art.author_id}
                  />
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      <div className="mt-20 border-t border-neutral-100 pt-12">
        <Pagination
          total={pageCount}
          fn={fetchArtworksByCriteria}
          fnArgs={[filterOptions, medium]}
          setArtworks={setArtworks}
          setCurrentPage={setCurrentPage}
          setIsLoading={setIsLoading}
          currentPage={currentPage}
        />
      </div>
    </div>
  );
}
