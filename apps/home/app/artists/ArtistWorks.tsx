import React from "react";
import { ArtworkSchemaTypes } from "@omenai/shared-types";
import ArtworkListing from "./ArtworksListing";

export default function ArtistWorks({
  loading,
  artworks,
}: {
  loading: boolean;
  artworks: ArtworkSchemaTypes[];
}) {
  // If we wanted to add filters later (e.g. "Available" vs "Sold"), we would put a minimal bar here.
  // For now, we present the pure archive.

  return (
    <div className="w-full">
      <div className="mb-8 flex items-end justify-between">
        <h3 className="font-serif text-3xl italic text-dark">The Archive</h3>
        <span className="font-mono text-xs text-neutral-400">
          {artworks?.length || 0} Works Cataloged
        </span>
      </div>

      <ArtworkListing artworks={artworks} />
    </div>
  );
}
