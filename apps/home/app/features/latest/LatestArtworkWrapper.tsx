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
        <div className="space-y-1 flex-1">
          <h1 className="text-sm md:text-md font-normal">Latest artworks</h1>
          <p className="text-base md:text-sm text-[#858585] font-light italic">
            Fresh Off the Easel: Explore the Newest Masterpieces, Just for You
          </p>
        </div>
        <Link
          href={"/categories/recent-artworks"}
          className="text-dark flex items-center gap-x-2 font-normal text-[14px] break-words"
        >
          View all
          <MdArrowRightAlt />
        </Link>
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
