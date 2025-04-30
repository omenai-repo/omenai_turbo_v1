"use client";
import { useQuery } from "@tanstack/react-query";
import { useWindowSize } from "usehooks-ts";
import { fetchTrendingArtworks } from "@omenai/shared-services/artworks/fetchTrendingArtworks";
import { categoriesFilterStore } from "@omenai/shared-state-store/src/categories/categoriesFilterStore";
import { categoriesStore } from "@omenai/shared-state-store/src/categories/categoriesStore";
import { ArtworksListingSkeletonLoader } from "@omenai/shared-ui-components/components/loader/ArtworksListingSkeletonLoader";
import NotFoundData from "@omenai/shared-ui-components/components/notFound/NotFoundData";
import { catalogChunk } from "@omenai/shared-utils/src/createCatalogChunks";
import ArtworkCard from "@omenai/shared-ui-components/components/artworks/ArtworkCard";
import Pagination from "@omenai/shared-ui-components/components/pagination/Pagination";

export function ArtworkListing({
  sessionId,
}: {
  sessionId: string | undefined;
}) {
  const {
    isLoading,
    setArtworks,
    artworks,
    currentPage,
    setCurrentPage,
    setIsLoading,
    artwork_total,
    set_artwork_total,
    pageCount,
    setPageCount,
  } = categoriesStore();
  const { filterOptions } = categoriesFilterStore();
  const { width } = useWindowSize();

  const { data: artworksArray, isLoading: loading } = useQuery({
    queryKey: ["get_paginated_artworks"],
    queryFn: async () => {
      const response = await fetchTrendingArtworks(currentPage, filterOptions);
      if (response?.isOk) {
        set_artwork_total(response.total);
        setArtworks(response.data);
        setPageCount(response.count);
        return { data: response.data, pages: response.count };
      } else throw new Error("Failed to fetch artworks");
    },
    refetchOnWindowFocus: false,
  });

  if (loading || isLoading) {
    return <ArtworksListingSkeletonLoader />;
  }

  if (!artworksArray || artworksArray.data.length === 0) {
    return (
      <div className="w-full h-full grid place-items-center">
        <NotFoundData />
      </div>
    );
  }

  const arts = catalogChunk(
    artworks,
    width <= 640 ? 1 : width <= 990 ? 2 : width <= 1440 ? 3 : 4
  );

  return (
    <div className="w-full mb-5 mt-3">
      <p className="text-[14px] font-bold mb-4">{artwork_total} artworks:</p>

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
        fn={fetchTrendingArtworks}
        setArtworks={setArtworks}
        setCurrentPage={setCurrentPage}
        setIsLoading={setIsLoading}
        currentPage={currentPage}
      />
    </div>
  );
}
