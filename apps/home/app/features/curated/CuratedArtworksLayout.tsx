"use client";
import { actionStore } from "@omenai/shared-state-store/src/actions/ActionStore";
import ArtworkCard from "@omenai/shared-ui-components/components/artworks/ArtworkCard";
import { catalogChunk } from "@omenai/shared-utils/src/createCatalogChunks";
import { useCallback, useState } from "react";
import { useWindowSize } from "usehooks-ts";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import CuratorialManifest from "./components/PreferencePicker";
import { ArtworkSchemaTypes } from "@omenai/shared-types";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    dragFree: true,
  });

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  return (
    <div className="w-full">
      {/* 1. Filter Tabs */}
      <CuratorialManifest
        setIsFading={setIsFading}
        preferences={user.preferences}
      />

      {/* 2. The Grid */}

      <div className="relative group">
        <button
          onClick={scrollPrev}
          className="absolute hidden  left-6 top-[140px] w-16 h-16 bg-[#FAF8F5] border border-[#E8E4DF] rounded-full shadow-[0_8px_30px_rgba(28,25,23,0.12)] md:flex items-center justify-center z-10 text-[#1C1917] transition-all hover:bg-[#1C1917] hover:text-[#FAF8F5] opacity-0 group-hover:opacity-100"
        >
          <ChevronLeft size={32} strokeWidth={1.5} className="ml-[-2px]" />
        </button>

        <button
          onClick={scrollNext}
          className="absolute right-6 hidden top-[140px] w-16 h-16 bg-[#FAF8F5] border border-[#E8E4DF] rounded-full shadow-[0_8px_30px_rgba(28,25,23,0.12)] md:flex items-center justify-center z-10 text-[#1C1917] transition-all hover:bg-[#1C1917] hover:text-[#FAF8F5] opacity-0 group-hover:opacity-100"
        >
          <ChevronRight size={32} strokeWidth={1.5} className="mr-[-2px]" />
        </button>
        <div
          className={`min-h-[500px] transition-all duration-300 ease-out ${
            isFading ? "translate-y-4 opacity-0" : "translate-y-0 opacity-100"
          }`}
        >
          {filteredArtworks.length > 0 ? (
            <div className="overflow-hidden" ref={emblaRef}>
              <div className="flex gap-5 items-end pb-4">
                {filteredArtworks.map((art: any, index: number) => {
                  return (
                    <div
                      key={art.art_id || index}
                      className="flex-[0_0_200px] min-w-0"
                    >
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
                        author_id={art.author_id}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            // Empty State
            <div className="flex h-64 w-full flex-col items-center justify-center rounded -lg border border-neutral-200 bg-white">
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
    </div>
  );
}
