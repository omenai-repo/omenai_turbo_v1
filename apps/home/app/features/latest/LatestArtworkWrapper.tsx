"use client";

import { fetchAllArtworks } from "@omenai/shared-services/artworks/fetchAllArtworks";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import LatestArtworks from "./LatestArtworks";
import { SectionLoaderContainers } from "../loaders/SectionLoaderContainers";

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
    staleTime: 30 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnMount: false,
  });

  if (isLoading) return <SectionLoaderContainers title="Unveiling New Works" />;

  return (
    <section className="w-full bg-white py-8 md:py-8 md:py-24 border-t border-neutral-100">
      <div className="container mx-auto px-6 lg:px-12">
        {/* 1. ARCHITECTURAL HEADER */}
        {/* We use the Split Layout to match the Roster and Curated sections */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 mb-20">
          {/* LEFT: The Headline & Signal */}
          <div className="max-w-3xl">
            {/* The "Live" Indicator */}
            <div className="flex items-center gap-3 mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded h-2 w-2 bg-red-500"></span>
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-neutral-500">
                Just Arrived
              </span>
            </div>

            <h2 className="text-5xl md:text-6xl font-serif text-neutral-900 leading-[0.9]">
              Fresh from <br />
              <span className="italic text-neutral-400">The Studio.</span>
            </h2>
          </div>

          {/* RIGHT: The Context */}
          <div className="max-w-xs flex flex-col gap-6 items-start md:items-end text-left md:text-right">
            <p className="font-sans text-xs leading-relaxed text-neutral-500">
              A curated selection of the most recent works uploaded by our
              diverse roster of verified artists.
            </p>
            {/* Decorative 'End of Section' Mark */}
            <div className="h-[1px] w-12 bg-dark md:self-end"></div>
          </div>
        </div>

        {/* 2. THE GRID (Content) */}
        <div className="w-full">
          {artworks?.length === 0 ? (
            <div className="flex h-[400px] w-full flex-col items-center justify-center border border-dashed border-neutral-200 bg-neutral-50">
              <span className="font-serif text-xl italic text-neutral-400">
                Catalog updating...
              </span>
            </div>
          ) : (
            <LatestArtworks artworks={artworks} sessionId={sessionId} />
          )}
        </div>
      </div>
    </section>
  );
}
