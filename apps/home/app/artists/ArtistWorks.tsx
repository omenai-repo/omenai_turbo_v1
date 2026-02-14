"use client";
import React, { useState, useMemo } from "react";
import { ArtworkSchemaTypes } from "@omenai/shared-types";
import ArtworkListing from "./ArtworksListing";
import { HiChevronDown } from "react-icons/hi";

type SortOption = "newest" | "oldest" | "price_asc" | "price_desc";
type FilterOption = "all" | "available" | "acquired";

export default function ArtistWorks({
  loading,
  artworks,
}: {
  loading: boolean;
  artworks: (ArtworkSchemaTypes & { createdAt: string })[];
}) {
  const [sortOption, setSortOption] = useState<SortOption>("newest");
  const [filterOption, setFilterOption] = useState<FilterOption>("all");

  // Combined Filter & Sort Logic
  const processedArtworks = useMemo(() => {
    if (!artworks) return [];

    // 1. FILTER STEP
    let filtered = artworks.filter((art) => {
      if (filterOption === "all") return true;
      if (filterOption === "available") return art.availability === true;
      if (filterOption === "acquired") return art.availability === false;
      return true;
    });

    // 2. SORT STEP
    const sorted = [...filtered];
    switch (sortOption) {
      case "newest":
        return sorted.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
      case "oldest":
        return sorted.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        );
      case "price_asc":
        return sorted.sort((a, b) => a.pricing.usd_price - b.pricing.usd_price);
      case "price_desc":
        return sorted.sort((a, b) => b.pricing.usd_price - a.pricing.usd_price);
      default:
        return sorted;
    }
  }, [artworks, sortOption, filterOption]);

  return (
    <div className="w-full mb-12">
      {/* HEADER & CONTROLS */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h3 className="font-serif text-3xl md:text-4xl text-dark">
            The Archive
          </h3>
          <p className="mt-2 font-sans text-sm text-neutral-500">
            Explore a curated selection of their available and acquired works.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <span className="font-mono text-xs text-neutral-400 uppercase tracking-wider hidden md:block">
            {processedArtworks?.length || 0} Items
          </span>

          {/* FILTER DROPDOWN */}
          <div className="relative group w-full sm:w-auto">
            <select
              value={filterOption}
              onChange={(e) => setFilterOption(e.target.value as FilterOption)}
              className="w-full sm:w-auto appearance-none focus:ring-0 outline-none bg-neutral-50 border border-neutral-200 text-dark text-fluid-xxs font-light uppercase tracking-wider pl-4 pr-10 py-2.5 rounded-sm focus:outline-none focus:border-[#091830] cursor-pointer"
            >
              <option value="all">All Works</option>
              <option value="available">Available Only</option>
              <option value="acquired">Acquired Only</option>
            </select>
          </div>

          {/* SORT DROPDOWN */}
          <div className="relative group w-full sm:w-auto">
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as SortOption)}
              className="w-full sm:w-auto appearance-none focus:ring-0 outline-none bg-neutral-50 border border-neutral-200 text-dark text-fluid-xxs font-light uppercase tracking-wider pl-4 pr-10 py-2.5 rounded-sm focus:outline-none focus:border-[#091830] cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      <ArtworkListing artworks={processedArtworks} />
    </div>
  );
}
