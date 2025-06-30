"use client";

import { fetchAllArtworks } from "@omenai/shared-services/artworks/fetchAllArtworks";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import LatestArtworks from "./LatestArtworks";
import { SectionLoaderContainers } from "../loaders/SectionLoaderContainers";
import NotFoundData from "@omenai/shared-ui-components/components/notFound/NotFoundData";

export default function LatestArtworkWrapper({
  sessionId,
}: {
  sessionId: string | undefined;
}) {
  const { data: artworks, isLoading } = useQuery({
    queryKey: ["latest"],
    queryFn: async () => {
      const data = await fetchAllArtworks(1);
      if (!data?.isOk) throw new Error("Something went wrong");
      else return data.data;
    },
    refetchOnWindowFocus: false,
  });

  if (isLoading) return <SectionLoaderContainers title="Latest artworks" />;

  return (
    <div className="">
      <div className="flex md:flex-row flex-col gap-4 mb-5">
        <div className="flex justify-between items-center w-full my-5">
          <div>
            <p className="text-[12px] ring-1 px-3 w-fit py-1 rounded-full ring-dark font-medium text-[#000000] my-5">
              Latest Artworks
            </p>
            <p className="text-fluid-sm sm:text-fluid-md font-bold text-[#000000] mt-[20px]">
              Newly Arrived: Explore Our Latest Artworks
            </p>
          </div>

          <div className="hidden sm:flex flex-col items-end">
            <p className="text-fluid-base font-bold">Fresh Off the Easel:</p>
            <p className="justify-self-end font-medium text-fluid-xxs">
              Explore the newest
            </p>
            <p className="justify-self-end font-medium text-fluid-xxs">
              masterpieces, just for you
            </p>
          </div>
        </div>
      </div>

      {artworks.length === 0 && (
        <div className="h-[300px] w-full place-items-center grid">
          <NotFoundData />
        </div>
      )}

      <LatestArtworks artworks={artworks} sessionId={sessionId} />
    </div>
  );
}
