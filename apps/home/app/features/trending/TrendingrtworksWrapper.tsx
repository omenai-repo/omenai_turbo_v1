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
    refetchOnWindowFocus: false,
  });

  if (isLoading) return <SectionLoaderContainers title="Trending artworks" />;
  return (
    <>
      <div className="flex md:flex-row flex-col gap-4 mb-5">
        <div className="flex justify-between items-center w-full my-5">
          <div>
            <p className="text-[12px] ring-1 px-3 w-fit py-1 rounded-full ring-dark font-medium text-[#000000] my-5">
              Trending artworks
            </p>
            <p className="text-fluid-sm sm:text-fluid-md font-bold text-[#000000] mt-[20px]">
              Trending artworks.
            </p>
          </div>

          <div className="hidden sm:flex flex-col items-end">
            <p className="text-fluid-base font-bold">
              Spotlight on Today&apos;s Must-Have Pieces:
            </p>
            <p className="justify-self-end font-medium text-fluid-xxs">
              On the Rise: Discover the Art
            </p>
            <p className="justify-self-end font-medium text-fluid-xxs">
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
