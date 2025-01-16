"use client";
import { ArtworksListingSkeletonLoader } from "@omenai/shared-ui-components/components/loader/ArtworksListingSkeletonLoader";
import NotFoundData from "@omenai/shared-ui-components/components/notFound/NotFoundData";
import { fetchArtworksByCriteria } from "@omenai/shared-services/artworks/fetchArtworksByCriteria";
import { catalogChunk } from "@omenai/shared-utils/src/createCatalogChunks";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import { useWindowSize } from "usehooks-ts";
import ArtworkCard from "@omenai/shared-ui-components/components/artworks/ArtworkCard";
import { FilterOptions } from "@omenai/shared-types";

export default function SimilarArtworks({
  title,
  sessionId,
  medium,
}: {
  title: string;
  sessionId: string | undefined;
  medium: string;
}) {
  const { width } = useWindowSize();
  const filter: FilterOptions = {
    price: [],
    year: [],
    rarity: [],
    medium: [],
  };

  const { data: artworksArray, isLoading: loading } = useQuery({
    queryKey: ["get_similar_artworks_by_criteria"],
    queryFn: async () => {
      const response = await fetchArtworksByCriteria(1, filter, medium);
      if (response?.isOk) {
        return response.data;
      } else throw new Error("Failed to fetch artworks");
    },
    refetchOnWindowFocus: false,
  });

  if (loading) {
    return <ArtworksListingSkeletonLoader />;
  }

  const artworks = artworksArray.filter((artwork: any) => {
    return artwork.title !== title;
  });
  if (!artworks || artworks.length === 0) {
    return (
      <div className="w-full h-full grid place-items-center">
        <NotFoundData />
      </div>
    );
  }

  const arts = catalogChunk(
    artworks,
    width < 640 ? 1 : width < 990 ? 2 : width < 1440 ? 3 : 4
  );
  return (
    <div className="w-full h-full py-5">
      <h1 className="text-dark font-bold text-sm">Hot recommendations</h1>

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
                  }
                )}
              </div>
            );
          })}
        </div>
      </div>
      <div className="flex items-center justify-center py-5">
        <Link href={`/collections/${medium}`} className="group">
          <button className="flex items-center gap-x-2  shadow-[8px_8px_0px_rgba(0,0,0,1)] group-hover:shadow-none duration-200 bg-white ring-1 ring-dark text-dark mt-10 px-8 z-20 rounded-full h-[40px]">
            View more <FiArrowRight size={18} />
          </button>
        </Link>
      </div>
    </div>
  );
}
