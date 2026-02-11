"use client";

import { useQuery } from "@tanstack/react-query";
import React from "react";
import TrendingArtworks from "./TrendingArtworks";
import { fetchAllArtworkImpressions } from "@omenai/shared-services/artworks/fetchArtworkImpressions";
import { SectionLoaderContainers } from "../loaders/SectionLoaderContainers";
import Link from "next/link";
import { HiArrowTrendingUp } from "react-icons/hi2";
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
    staleTime: 30 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  if (isLoading) return <SectionLoaderContainers title="Loading Trends" />;

  return (
    <section className="w-full py-16 md:py-24 bg-white border-t border-neutral-100">
      <div className="px-4">
        {/* 1. MARKETPLACE HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="flex items-center justify-center h-6 w-6 rounded-full bg-[#091830]/10 text-dark ">
                <HiArrowTrendingUp size={14} />
              </span>
              <span className="text-xs font-sans font-bold text-dark  tracking-wide uppercase">
                Trending works
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-serif text-dark ">
              Trending Now
            </h2>
            <p className="mt-2 font-sans text-sm text-neutral-500 max-w-lg">
              Works capturing collector attention this week.
            </p>
          </div>

          <div className="hidden md:block">
            <Link
              href="/catalog?filter=trending"
              className="text-sm font-sans font-medium text-dark  hover:underline underline-offset-4"
            >
              View All Trending
            </Link>
          </div>
        </div>

        {/* 2. CONTENT */}
        {artworks?.length === 0 ? (
          <div className="h-64 w-full place-items-center grid border border-dashed border-neutral-200 rounded-lg">
            <NotFoundData />
          </div>
        ) : (
          <TrendingArtworks artworks={artworks} sessionId={sessionId} />
        )}

        {/* Mobile View All */}
        <div className="mt-10 flex md:hidden justify-center">
          <Link
            href="/catalog?filter=trending"
            className="w-full py-3 text-center rounded-md border border-neutral-200 text-sm font-sans font-medium text-neutral-800"
          >
            View All Trending
          </Link>
        </div>
      </div>
    </section>
  );
}
