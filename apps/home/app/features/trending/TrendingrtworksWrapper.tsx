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
      <section className="w-full py-8 md:py-24 bg-white border-t border-neutral-100">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-12">
            {/* LEFT SIDE: The Momentum Indicator */}
            <div className="md:col-span-5 space-y-6">
              <div className="flex items-center gap-3">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded h-2 w-2 bg-red-500"></span>
                </span>
                <span className="text-[10px] font-normal tracking-[0.3em] text-neutral-400 uppercase">
                  Follow the trend
                </span>
              </div>

              <h2 className="text-5xl md:text-6xl font-serif text-neutral-900 leading-tight">
                The <span className="italic">Trending</span> <br />
                Selection.
              </h2>
            </div>

            {/* RIGHT SIDE: The Curatorial Context */}
            <div className="md:col-span-7 md:pl-12 border-l border-neutral-200 space-y-6">
              <p className="text-neutral-600 text-lg font-light leading-relaxed max-w-xl">
                A reflection of the global collector's eye. These pieces are
                currently commanding the most attention, engagement, and inquiry
                within our ecosystem.
              </p>

              <div className="flex items-center gap-6">
                <p className="text-slate-300 text-fluid-xxs font-light italic">
                  Updated frequently based on user interactions
                </p>
                <div className="flex-1 h-[1px] bg-neutral-100"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {artworks?.length === 0 && (
        <div className="h-[500px] w-full place-items-center grid">
          <NotFoundData />
        </div>
      )}

      <TrendingArtworks artworks={artworks} sessionId={sessionId} />
    </>
  );
}
