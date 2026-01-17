"use client";
import { actionStore } from "@omenai/shared-state-store/src/actions/ActionStore";
import ArtworkCard from "@omenai/shared-ui-components/components/artworks/ArtworkCard";
import { catalogChunk } from "@omenai/shared-utils/src/createCatalogChunks";
import Link from "next/link";
import { useState } from "react";
import { useWindowSize } from "usehooks-ts";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import CuratorialManifest from "./components/PreferencePicker"; // Imported the new picker
import { GoArrowRight } from "react-icons/go";
import { IoIosArrowRoundForward } from "react-icons/io";

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

  // Chunking for Masonry
  const columns = width <= 640 ? 1 : width <= 990 ? 2 : width <= 1440 ? 3 : 4;
  const arts = catalogChunk(filteredArtworks, columns);

  return (
    <div className="w-full">
      {/* 1. The Control Rail (Manifest) */}
      <CuratorialManifest
        setIsFading={setIsFading}
        preferences={user.preferences}
      />

      {/* 2. The Gallery Space */}
      <div
        className={`min-h-[500px] transition-all duration-500 ease-in-out ${
          isFading ? "translate-y-4 opacity-0" : "translate-y-0 opacity-100"
        }`}
      >
        {filteredArtworks.length > 0 ? (
          <div className="flex flex-wrap justify-center gap-8 md:gap-12">
            {arts.map((column: any[], colIndex: number) => (
              <div className="flex flex-1 flex-col gap-12" key={colIndex}>
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
          // Empty State - "The White Wall"
          <div className="flex h-[40vh] w-full flex-col items-center justify-center border border-dashed border-neutral-200">
            <span className="font-serif text-2xl italic text-neutral-300">
              No works available in this medium.
            </span>
          </div>
        )}
      </div>

      {/* 3. The Footer Action (No Gradient) */}
      <div className="mt-20 flex justify-center border-t border-black pt-8">
        <Link href={"/catalog"} className="group relative z-20">
          <button className="flex items-center gap-4 bg-white px-8 py-4 text-dark transition-all duration-500 ease-out hover:bg-dark hover:text-white border border-neutral-200 hover:border-black">
            {/* TYPOGRAPHY: Technical/Mono for the label */}
            <span className="font-mono text-[10px] uppercase tracking-[0.25em]">
              Enter Full Archive
            </span>

            {/* ICON: Slide animation */}
            <IoIosArrowRoundForward className="text-2xl transition-transform duration-300 group-hover:translate-x-2" />
          </button>
        </Link>
      </div>
    </div>
  );
}
