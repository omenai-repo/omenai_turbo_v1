"use client";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { SectionLoaderContainers } from "../loaders/SectionLoaderContainers";

import { HiUserGroup } from "react-icons/hi2";
import { fetchFeaturedGalleries } from "@omenai/shared-services/gallery/fetchFeaturedGallery";
import FeaturedGallery from "./FeaturedGallery";

export default function FeaturedgalleryWrapper() {
  const { data: galleries, isLoading } = useQuery({
    queryKey: ["featured_galleries"],
    queryFn: async () => {
      const data = await fetchFeaturedGalleries();
      if (!data?.isOk) throw new Error("Something went wrong");
      else return data.data;
    },
    refetchOnWindowFocus: false,
  });

  if (isLoading) return <SectionLoaderContainers title="Loading Galleries" />;

  return (
    <section className="w-full bg-white py-16 md:py-24 border-t border-neutral-100">
      <div className="px-4">
        {/* 1. MARKETPLACE HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="flex items-center justify-center h-6 w-6 rounded -full bg-[#091830]/10 text-dark ">
                <HiUserGroup size={14} />
              </span>
              <span className="text-xs font-sans font-bold text-dark  tracking-wide uppercase">
                Gallery Roster
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-serif text-dark ">
              Featured Galleries
            </h2>
            <p className="mt-2 font-sans text-sm text-neutral-500 max-w-lg">
              Discover galleries gaining collector attention right now.
            </p>
          </div>
        </div>

        {/* 2. DATA DISPLAY */}
        <div className="w-full">
          {galleries?.length === 0 ? (
            <div className="flex h-64 w-full flex-col items-center justify-center rounded -lg border border-dashed border-neutral-200 bg-neutral-50">
              <span className="font-sans text-neutral-400">
                Artist roster updating...
              </span>
            </div>
          ) : (
            <FeaturedGallery galleries={galleries} />
          )}
        </div>
      </div>
    </section>
  );
}
