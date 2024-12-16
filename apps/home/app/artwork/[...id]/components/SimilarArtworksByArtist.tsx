"use client";

import { fetchSimilarArtworksByArtist } from "@omenai/shared-services/artworks/fetchSimilarArtworksByArtist";
import ArtworkCanvas from "@omenai/shared-ui-components/components/artworks/ArtworkCanvas";
import { ArtworksListingSkeletonLoader } from "@omenai/shared-ui-components/components/loader/ArtworksListingSkeletonLoader";
import NotFoundData from "@omenai/shared-ui-components/components/notFound/NotFoundData";
import { catalogChunk } from "@omenai/shared-utils/src/createCatalogChunks";
import { useQuery } from "@tanstack/react-query";

import { useWindowSize } from "usehooks-ts";

export default function SimilarArtworksByArtist({
  sessionId,
  artist,
}: {
  sessionId: string | undefined;
  artist: string;
}) {
  const { width } = useWindowSize();

  const { data: artworksArray, isLoading: loading } = useQuery({
    queryKey: ["get_similar_artworks_by_artist"],
    queryFn: async () => {
      const response = await fetchSimilarArtworksByArtist(artist);
      if (response?.isOk) {
        return response.data;
      } else throw new Error("Failed to fetch artworks");
    },
    refetchOnWindowFocus: false,
  });

  if (loading) {
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
    artworksArray,
    width < 400 ? 1 : width < 768 ? 2 : width < 1280 ? 3 : width < 1440 ? 4 : 5
  );
  return (
    <div className="w-full h-full p-5">
      <h1 className="text-dark font-normal text-sm">Other works by {artist}</h1>

      <div className="w-full my-5">
        <div className="flex flex-wrap gap-x-4 justify-center">
          {arts.map((artworks: any[], index) => {
            return (
              <div className="flex-1 gap-4 space-y-12" key={index}>
                {artworks.map(
                  (art: {
                    url: string;
                    title: string;
                    artist: string;
                    _id: string;
                    pricing: {
                      price: number;
                      usd_price: number;
                      shouldShowPrice: "Yes" | "No" | string;
                    };
                    impressions: number;
                    like_IDs: string[];
                    art_id: string;
                    medium: string;
                    rarity: string;
                    availability: boolean;
                  }) => {
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
                  }
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
