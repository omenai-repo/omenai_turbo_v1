"use client";

import { useQuery } from "@tanstack/react-query";
import React from "react";
import TrendingArtworks from "./TrendingArtworks";
import { fetchAllArtworkImpressions } from "@omenai/shared-services/artworks/fetchArtworkImpressions";
import { SectionLoaderContainers } from "../loaders/SectionLoaderContainers";
import Link from "next/link";
import { MdArrowRightAlt } from "react-icons/md";
import NotFoundData from "@omenai/shared-ui-components/components/notFound/NotFoundData";

export default function TrendingArtworkWrapper({
  sessionId,
}: {
  sessionId: string | undefined;
}) {
  const { data: artworks, isLoading } = useQuery({
    queryKey: ["trending"],
    queryFn: async () => {
      const data = await fetchAllArtworkImpressions(1);

      if (!data?.isOk) throw new Error("Something went wrong");
      return data.data;
    },
    staleTime: 30 * 60 * 1000, // Data is fresh for 5 minutes
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false, // Don't refetch if we have cached data
  });

  if (isLoading) return <SectionLoaderContainers title="Trending artworks" />;
  return (
    <>
      <div className="flex md:flex-row flex-col gap-4 mb-5">
        <div className="flex justify-between items-center w-full my-5">
          <div>
            <p className="text-fluid-xxs font-normal text-dark border-b border-dark/20 pb-1 my-5 w-fit">
              Trending artworks
            </p>
            <p className="text-fluid-base sm:text-fluid-md font-semibold text-[#000000] mt-[20px]">
              Hot on the Canvas: Trending Artworks You Need to See
            </p>
          </div>

          <div className="hidden sm:flex flex-col items-end">
            <p className="text-fluid-base font-semibold">
              Spotlight on Today&apos;s Must-Have Pieces:
            </p>
            <p className="justify-self-end font-normal leading-snug text-fluid-xxs">
              On the Rise: Discover the Art
            </p>
            <p className="justify-self-end font-normal leading-snug text-fluid-xxs">
              Everyone&apos;s Talking About
            </p>
          </div>
        </div>
      </div>
      {artworks?.length === 0 && (
        <div className="h-[500px] w-full place-items-center grid">
          <NotFoundData />
        </div>
      )}

      <TrendingArtworks artworks={artworks} sessionId={sessionId} />
    </>
  );
}
