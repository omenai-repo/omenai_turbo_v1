"use client";
import { actionStore } from "@omenai/shared-state-store/src/actions/ActionStore";
import ArtworkCard from "@omenai/shared-ui-components/components/artworks/ArtworkCard";
import { catalogChunk } from "@omenai/shared-utils/src/createCatalogChunks";
import { useState } from "react";
import { useWindowSize } from "usehooks-ts";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import CuratorialManifest from "./components/PreferencePicker";

export default function ExhibitionGrid({
  sessionId,
  userCuratedArtworks,
}: {
  sessionId: string | undefined;
  userCuratedArtworks: any;
}) {
  const { width } = useWindowSize();
  const { curated_preference } = actionStore();
  const { user } = useAuth({ requiredRole: "user" });
  const [isFading, setIsFading] = useState(false);

  // Filter Logic
  const filteredArtworks = userCuratedArtworks.filter((artwork: any) => {
    if (curated_preference === "All") return true;
    return artwork.medium === curated_preference;
  });

  // Masonry Columns logic
  const columns = width <= 640 ? 1 : width <= 990 ? 2 : width <= 1440 ? 3 : 4;
  const arts = catalogChunk(filteredArtworks, columns);

  return (
    <div className="w-full">
      {/* 1. Filter Tabs */}
      <CuratorialManifest
        setIsFading={setIsFading}
        preferences={user.preferences}
      />

      {/* 2. The Grid */}
      <div
        className={`min-h-[500px] transition-all duration-300 ease-out ${
          isFading ? "translate-y-4 opacity-0" : "translate-y-0 opacity-100"
        }`}
      >
        {filteredArtworks.length > 0 ? (
          <div className="flex flex-wrap justify-center gap-6 md:gap-8">
            {arts.map((column: any[], colIndex: number) => (
              <div className="flex flex-1 flex-col gap-8" key={colIndex}>
                {column.map((art: any) => (
                  <ArtworkCard
                    key={art.art_id}
                    image={art.url}
                    name={art.title}
                    artist={art.artist}
                    art_id={art.art_id}
                    pricing={art.pricing}
                    impressions={art.impressions}
                    likeIds={art.like_IDs}
                    sessionId={sessionId}
                    availability={art.availability}
                    medium={art.medium}
                    trending={false}
                    author_id={art.author_id}
                  />
                ))}
              </div>
            ))}
          </div>
        ) : (
          // Empty State
          <div className="flex h-64 w-full flex-col items-center justify-center rounded-lg border border-neutral-200 bg-white">
            <span className="font-sans font-medium text-neutral-400">
              No works found in {curated_preference}.
            </span>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 text-xs font-bold uppercase tracking-wide text-dark  underline underline-offset-4"
            >
              Refresh Feed
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
