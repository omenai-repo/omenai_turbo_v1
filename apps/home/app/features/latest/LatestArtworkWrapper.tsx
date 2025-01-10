"use client";

import { fetchAllArtworks } from "@omenai/shared-services/artworks/fetchAllArtworks";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import LatestArtworks from "./LatestArtworks";
import { SectionLoaderContainers } from "../loaders/SectionLoaderContainers";
import Link from "next/link";
import { MdArrowRightAlt } from "react-icons/md";
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
    <>
      <div className="flex md:flex-row flex-col gap-4 my-5">
        <div className="flex justify-between items-start w-full mb-[50px]">
          <div>
            <div className="border-[1.5px] border-[#000000] rounded-[62px] py-[8px] px-[15px] font-medium">
              Latest Artworks
            </div>
            <p className="text-[30px] font-bold text-[#000000] mt-[20px]">
              Latest Artworks.
            </p>
          </div>

          <div className="">
            <div className="flex text-[24px] font-bold">
              Fresh Off the Easel: <div className="font-medium">Explore</div>
            </div>
            <div className="text-right text-[24px] font-medium">the Newest</div>
            <div className="text-right text-[24px] font-medium">
              Masterpieces, Just for You
            </div>
          </div>
        </div>
      </div>

      {artworks.length === 0 && (
        <div className="h-[500px] w-full place-items-center grid">
          <NotFoundData />
        </div>
      )}

      <LatestArtworks artworks={artworks} sessionId={sessionId} />
    </>
  );
}
