import NotFoundData from "@omenai/shared-ui-components/components/notFound/NotFoundData";
import React from "react";
import TrendingArtworks from "../trending/TrendingArtworks";
import { TrendingArtistCard } from "@omenai/shared-ui-components/components/artists/TrendingArtistCard";
import { fetchTrendingArtists } from "@omenai/shared-services/artist/fetchTrendingArtist";
import { useQuery } from "@tanstack/react-query";
import { SectionLoaderContainers } from "../loaders/SectionLoaderContainers";
import TrendingArtist from "./TrendingArtist";

export default function TrendingArtistWrapper() {
  const { data: artists, isLoading } = useQuery({
    queryKey: ["trending_artists"],
    queryFn: async () => {
      const data = await fetchTrendingArtists();
      if (!data?.isOk) throw new Error("Something went wrong");
      else return data.data;
    },
    refetchOnWindowFocus: false,
  });

  if (isLoading) return <SectionLoaderContainers title="Latest artworks" />;

  return (
    <>
      <div className="flex md:flex-row flex-col gap-4 mb-4">
        <div className="flex justify-between items-center w-full my-4">
          <div>
            <p className="text-[12px] ring-1 px-3 w-fit py-1 rounded ring-dark font-normal leading-snug text-[#000000] my-3">
              Trending Artists
            </p>
            <p className="text-fluid-sm sm:text-fluid-md  font-bold text-[#000000] mt-[20px]">
              Artists making the rave on Omenai
            </p>
          </div>

          <div className="hidden sm:flex flex-col items-end">
            <p className="text-fluid-base font-bold ">
              Omenai's Hot Picks: Unveiling Trending Artists
            </p>
            <p className="justify-self-end font-normal leading-snug text-fluid-xs">
              A world of the talented artists
            </p>
            <p className="justify-self-end font-normal leading-snug text-fluid-xs">
              setting new trends and inspiring conversations
            </p>
          </div>
        </div>
      </div>
      {artists?.length === 0 && (
        <div className="h-[500px] w-full place-items-center grid">
          <NotFoundData />
        </div>
      )}

      <TrendingArtist artists={artists} />
    </>
  );
}
