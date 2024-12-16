"use client";

import { useQuery } from "@tanstack/react-query";
import { useWindowSize } from "usehooks-ts";
import Pagination from "./Pagination";
import { useContext } from "react";
import { SessionContext } from "@omenai/package-provider/SessionProvider";
import { fetchCuratedArtworks } from "@omenai/shared-services/artworks/fetchedCuratedArtworks";
import { categoriesFilterStore } from "@omenai/shared-state-store/src/categories/categoriesFilterStore";
import { categoriesStore } from "@omenai/shared-state-store/src/categories/categoriesStore";
import ArtworkCanvas from "@omenai/shared-ui-components/components/artworks/ArtworkCanvas";
import { ArtworksListingSkeletonLoader } from "@omenai/shared-ui-components/components/loader/ArtworksListingSkeletonLoader";
import NotFoundData from "@omenai/shared-ui-components/components/notFound/NotFoundData";
import { catalogChunk } from "@omenai/shared-utils/src/createCatalogChunks";
import { IndividualSchemaTypes } from "@omenai/shared-types";

export function ArtworkListing({
  sessionId,
}: {
  sessionId: string | undefined;
}) {
  const { session } = useContext(SessionContext);
  const { isLoading, setArtworks, artworks, paginationCount, setPageCount } =
    categoriesStore();
  const { filterOptions } = categoriesFilterStore();
  const { width } = useWindowSize();

  const { data: artworksArray, isLoading: loading } = useQuery({
    queryKey: ["get_paginated_artworks"],
    queryFn: async () => {
      const response = await fetchCuratedArtworks(
        paginationCount,
        (session as IndividualSchemaTypes)?.preferences,
        filterOptions
      );
      if (response?.isOk) {
        setPageCount(response.pageCount);
        setArtworks(response.data);
        // set_artwork_total(response.total);
        return response.data;
      } else throw new Error("Failed to fetch artworks");
    },
    refetchOnWindowFocus: false,
  });

  if (loading || isLoading) {
    return <ArtworksListingSkeletonLoader />;
  }

  if (!artworksArray || artworksArray.length === 0) {
    return (
      <div className="w-full h-full grid place-items-center">
        <NotFoundData />
      </div>
    );
  }

  const arts = catalogChunk(
    artworks,
    width < 400 ? 1 : width < 768 ? 2 : width < 1280 ? 3 : width < 1440 ? 4 : 5
  );

  return (
    <div className="w-full mb-5 px-5 mt-3">
      {/* <p className="text-xs font-normal mb-4">{artwork_total} artworks:</p> */}

      <div className="flex flex-wrap gap-x-4 justify-center">
        {arts.map((artworks: any[], index) => {
          return (
            <div className="flex-1 gap-2 space-y-6" key={index}>
              {artworks.map((art: any) => {
                return (
                  <ArtworkCanvas
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
                  />
                );
              })}
            </div>
          );
        })}
        {/* first */}
      </div>

      <Pagination />
    </div>
  );
}
