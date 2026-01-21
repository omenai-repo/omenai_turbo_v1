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
import { HiViewGrid } from "react-icons/hi";

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
    queryKey: ["get_artworks_by_collection", medium, currentPage],
    queryFn: async () => {
      const response = await fetchArtworksByCriteria(
        currentPage,
        filterOptions,
        medium,
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
      <div className="flex h-96 w-full flex-col items-center justify-center rounded-lg border border-dashed border-neutral-300 bg-neutral-50">
        <div className="scale-75 opacity-50">
          <NotFoundData />
        </div>
      </div>
    );
  }

  const arts = catalogChunk(
    artworks,
    width <= 640 ? 1 : width <= 990 ? 2 : width <= 1440 ? 3 : 4,
  );

  return (
    <div className="w-full">
      {/* 1. Results Header */}
      <div className="mb-8 flex items-center justify-between border-b border-neutral-100 pb-4">
        <div className="flex items-center gap-2">
          <HiViewGrid className="text-neutral-400" />
          <span className="font-sans text-sm font-medium text-neutral-500">
            Showing <strong className="text-dark ">{artwork_total}</strong>{" "}
            results
          </span>
        </div>
      </div>

      {/* 2. The Masonry Grid */}
      <div className="flex flex-wrap justify-center gap-6 md:gap-8">
        {arts.map((column: any[], colIndex) => {
          return (
            <div className="flex flex-1 flex-col gap-8" key={colIndex}>
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

      {/* 3. Pagination */}
      <div className="mt-20 border-t border-neutral-100 pt-12 flex justify-center">
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
