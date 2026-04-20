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
    <section className="w-full bg-white p-8 overflow-hidden">
      <div className="max-w-[1800px] mx-auto">
        {/* 1. MARKETPLACE HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              <span className="font-sans text-[10px] text-black tracking-[0.2em] uppercase font-bold">
                Recently Added
              </span>
            </div>
            <h2 className="font-serif text-3xl font-light text-black leading-none tracking-tight">
              New Arrivals
            </h2>
          </div>

          <div className="hidden md:flex items-center">
            <Link
              href="/catalog"
              className="group flex items-center gap-2 font-sans text-[11px] uppercase tracking-widest font-bold text-black border-b border-transparent hover:border-black transition-all pb-1"
            >
              View All Arrivals
              <IoArrowForward
                className="transition-transform duration-300 group-hover:translate-x-1"
                size={14}
              />
            </Link>
          </div>
        </div>

        {/* 2. THE GRID */}
        <div className="w-full">
          {artworks?.length === 0 ? (
            <div className="flex h-[40vh] w-full flex-col items-center justify-center bg-[#fafafa] border border-neutral-100">
              <span className="font-serif text-2xl font-light text-neutral-400 italic tracking-wide">
                Catalog updating...
              </span>
            </div>
          ) : (
            <div className="-mx-4 md:mx-0 px-4 md:px-0">
              <LatestArtworks artworks={artworks} sessionId={sessionId} />
            </div>
          )}
        </div>

        {/* Mobile View All Button (Visible only on small screens) */}
        <div className="mt-14 flex justify-center md:hidden">
          <Link
            href="/catalog"
            className="w-full text-center py-4 border border-black font-sans text-[10px] uppercase tracking-widest font-bold text-black hover:bg-black hover:text-white transition-colors duration-300"
          >
            View Full Archive
          </Link>
        </div>
      </div>
    </section>
  );
}
