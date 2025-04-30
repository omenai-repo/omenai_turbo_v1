"use client";

import { fetchPaginatedArtworks } from "@omenai/shared-services/artworks/fetchPaginatedArtworks";
import { artworkActionStore } from "@omenai/shared-state-store/src/artworks/ArtworkActionStore";
import { artworkStore } from "@omenai/shared-state-store/src/artworks/ArtworkStore";
import { useQuery } from "@tanstack/react-query";
import { useWindowSize } from "usehooks-ts";
import { ArtworksListingSkeletonLoader } from "@omenai/shared-ui-components/components/loader/ArtworksListingSkeletonLoader";
import NotFoundData from "@omenai/shared-ui-components/components/notFound/NotFoundData";
import { catalogChunk } from "@omenai/shared-utils/src/createCatalogChunks";
import ArtworkCard from "@omenai/shared-ui-components/components/artworks/ArtworkCard";
import Pagination from "@omenai/shared-ui-components/components/pagination/Pagination";
import { filterStore } from "@omenai/shared-state-store/src/artworks/FilterStore";
export default function AllArtworks({
  sessionId,
}: {
  sessionId: string | undefined;
}) {
  const { currentPage, setCurrentPage } = artworkActionStore();
  const {
    isLoading,
    setArtworks,
    setIsLoading,
    artworks,
    artwork_total,
    set_artwork_total,
    setPageCount,
    pageCount,
  } = artworkStore();
  const { filterOptions } = filterStore();

  const { width } = useWindowSize();

  const { data: artworksArray, isLoading: loading } = useQuery({
    queryKey: ["get_paginated_artworks"],
    queryFn: async () => {
      const response = await fetchPaginatedArtworks(currentPage, filterOptions);
      if (response?.isOk) {
        setArtworks(response.data);
        set_artwork_total(response.total);
        setPageCount(response.count);
        return { data: response.data, pages: response.count };
      } else throw new Error("Failed to fetch artworks");
    },
    refetchOnWindowFocus: false,
    gcTime: 0,
  });

  if (loading || isLoading) {
    return <ArtworksListingSkeletonLoader />;
  }

  if (
    !artworksArray ||
    artworksArray.data.length === 0 ||
    artworks.length === 0
  ) {
    return (
      <div className="w-full h-full grid place-items-center my-12">
        <NotFoundData />
      </div>
    );
  }

  const arts = catalogChunk(
    artworks,
    width <= 640 ? 1 : width <= 990 ? 2 : width <= 1440 ? 3 : 4
  );

  return (
    <div className="w-full my-3">
      <p className="text-fluid-xs font-bold mb-4">{artwork_total} artworks:</p>

      <div className="flex flex-wrap gap-x-4 justify-center">
        {arts.map((artworks: any[], index) => {
          return (
            <div className="flex-1 gap-2 space-y-6" key={index}>
              {artworks.map((art: any) => {
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
                  />
                );
              })}
            </div>
          );
        })}
        {/* first */}
      </div>

      <Pagination
        total={pageCount}
        filterOptions={filterOptions}
        fn={fetchPaginatedArtworks}
        setArtworks={setArtworks}
        setCurrentPage={setCurrentPage}
        setIsLoading={setIsLoading}
        currentPage={currentPage}
      />
    </div>
  );
}
// grid xxm:grid-cols-2 md:grid-cols-3 2lg:grid-cols-4 xl:grid-cols-5 3xl:grid-cols-7 justify-center md:space-y-4 space-x-2 items-end
