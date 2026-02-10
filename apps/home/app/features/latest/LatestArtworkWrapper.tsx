"use client";

import { fetchAllArtworks } from "@omenai/shared-services/artworks/fetchAllArtworks";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import LatestArtworks from "./LatestArtworks";
import { SectionLoaderContainers } from "../loaders/SectionLoaderContainers";
import Link from "next/link";
import { IoArrowForward } from "react-icons/io5";

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

  if (isLoading)
    return <SectionLoaderContainers title="Loading New Arrivals" />;

  return (
    <section className="w-full bg-white py-16">
      <div className=" px-4">
        {/* 1. MARKETPLACE HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              <span className="text-xs font-sans font-bold text-dark  tracking-wide uppercase">
                Recently Added
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-serif text-dark ">
              New Arrivals
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/catalog"
              className="group flex items-center gap-2 text-sm font-sans font-medium text-neutral-500 hover:text-dark  transition-colors"
            >
              View All Arrivals
              <IoArrowForward className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* 2. THE GRID */}
        <div className="w-full">
          {artworks?.length === 0 ? (
            <div className="flex h-64 w-full flex-col items-center justify-center rounded-lg bg-neutral-50 border border-neutral-100">
              <span className="font-sans text-neutral-400">
                Catalog updating...
              </span>
            </div>
          ) : (
            <LatestArtworks artworks={artworks} sessionId={sessionId} />
          )}
        </div>

        {/* Mobile View All Button (Visible only on small screens) */}
        <div className="mt-12 flex justify-center md:hidden">
          <Link
            href="/catalog"
            className="w-full text-center py-3 rounded-md border border-neutral-200 text-sm font-sans font-medium text-neutral-800"
          >
            View Full Archive
          </Link>
        </div>
      </div>
    </section>
  );
}
