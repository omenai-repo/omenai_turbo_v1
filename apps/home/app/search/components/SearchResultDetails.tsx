"use client";

import { ArtworkSchemaTypes } from "@omenai/shared-types";
import ArtworkCard from "@omenai/shared-ui-components/components/artworks/ArtworkCard";
import { catalogChunk } from "@omenai/shared-utils/src/createCatalogChunks";
import { useWindowSize } from "usehooks-ts";
import { HiSearch } from "react-icons/hi";
import MasonryGrid from "@omenai/shared-ui-components/components/artworks/MasonryGrid";

type SearchResultDetailsProps = {
  data: (Pick<
    ArtworkSchemaTypes,
    | "art_id"
    | "artist"
    | "pricing"
    | "title"
    | "url"
    | "impressions"
    | "like_IDs"
    | "medium"
    | "rarity"
    | "availability"
  > & { _id: string })[];
  searchTerm: string;
  sessionId: string | undefined;
};

export default function SearchResultDetails({
  data,
  searchTerm,
  sessionId,
}: SearchResultDetailsProps) {
  const { width } = useWindowSize();

  return (
    <div className="w-full">
      {/* HEADER */}
      <div className="mb-10 border-b border-neutral-100 pb-6">
        <div className="flex items-center gap-2 mb-2 text-neutral-400">
          <HiSearch className="text-lg" />
          <span className="font-sans text-xs font-bold uppercase tracking-widest">
            Search Results
          </span>
        </div>
        <h1 className="font-serif text-2xl md:text-3xl text-dark ">
          Found {data.length} {data.length === 1 ? "work" : "works"} for{" "}
          <span className="italic text-neutral-500">“{searchTerm}”</span>
        </h1>
      </div>

      <MasonryGrid>
        {data.map((art: any) => {
          return (
            <ArtworkCard
              key={art.art_id}
              image={art.url}
              name={art.title}
              artist={art.artist}
              art_id={art.art_id}
              pricing={art.pricing}
              impressions={art.impressions as number}
              likeIds={art.like_IDs as string[]}
              sessionId={sessionId}
              availability={art.availability}
              medium={art.medium}
              author_id={art.author_id}
            />
          );
        })}
      </MasonryGrid>
    </div>
  );
}
