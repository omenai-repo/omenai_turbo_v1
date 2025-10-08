"use client";

import { ArtworksListingSkeletonLoader } from "@omenai/shared-ui-components/components/loader/ArtworksListingSkeletonLoader";
import { getAllArtworksById } from "@omenai/shared-services/artworks/fetchAllArtworksById";
import { catalogChunk } from "@omenai/shared-utils/src/createCatalogChunks";
import { useQuery } from "@tanstack/react-query";
import { useWindowSize } from "usehooks-ts";
import NotFoundData from "@omenai/shared-ui-components/components/notFound/NotFoundData";
import ArtworkCard from "@omenai/shared-ui-components/components/artworks/ArtworkCard";
import React from "react";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { ArtworkMediumTypes, ArtworkSchemaTypes } from "@omenai/shared-types";

export default function ArtCatalog() {
  const { user } = useAuth({ requiredRole: "artist" });

  const { width } = useWindowSize();

  const { data: artworks, isLoading } = useQuery({
    queryKey: ["fetch_artworks_by_id", user.artist_id],
    queryFn: async () => {
      const artworks = await getAllArtworksById(user.artist_id as string);
      if (artworks!.isOk) {
        return artworks!.data;
      } else {
        return [];
      }
    },
    refetchOnWindowFocus: false,

    enabled: !!user.artist_id,
  });

  if (isLoading) {
    return <ArtworksListingSkeletonLoader />;
  }

  const reversedArtworks = [...artworks].reverse();

  const arts = catalogChunk(
    reversedArtworks,
    width <= 640 ? 1 : width <= 990 ? 2 : width < 1500 ? 3 : 4
  );
  return (
    <div className="py-4 w-full">
      {artworks.length === 0 ? (
        <div className="w-full h-full grid place-items-center">
          <NotFoundData />
        </div>
      ) : (
        <div className="w-full mb-5 mt-3">
          <div className="flex flex-wrap gap-x-4 justify-center">
            {arts.map((artworks: any[], index) => {
              return (
                <div className="flex-1 gap-2 space-y-6" key={index}>
                  {artworks.map((art: ArtworkSchemaTypes) => {
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
                        sessionId={user.artist_id as string}
                        availability={art.availability}
                        isDashboard={true}
                        dashboard_type="artist"
                        medium={art.medium as ArtworkMediumTypes}
                        countdown={
                          art.exclusivity_status?.exclusivity_type ===
                            "exclusive" &&
                          art.exclusivity_status?.exclusivity_end_date
                            ? (art.exclusivity_status
                                .exclusivity_end_date as Date)
                            : null
                        }
                      />
                    );
                  })}
                </div>
              );
            })}
            {/* first */}
          </div>
        </div>
      )}
    </div>
  );
}
