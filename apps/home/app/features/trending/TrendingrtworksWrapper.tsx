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
      <div className="flex gap-4 my-5 flex-col md:flex-row">
        <div className="space-y-1 flex-1">
          <h1 className="text-sm md:text-md font-normal">Trending artworks</h1>
          <p className="text-base md:text-sm text-[#858585] font-light italic">
            On the Rise: Discover the Art Everyone&apos;s Talking About
          </p>
        </div>
        <Link
          href={"/categories/trending-artworks"}
          className="text-dark flex items-center gap-x-2 font-normal text-[14px] break-words"
        >
          View all
          <MdArrowRightAlt />
        </Link>
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
