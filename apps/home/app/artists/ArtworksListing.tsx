"use client";
import { useWindowSize } from "usehooks-ts";
import NotFoundData from "@omenai/shared-ui-components/components/notFound/NotFoundData";
import { catalogChunk } from "@omenai/shared-utils/src/createCatalogChunks";
import ArtworkCard from "@omenai/shared-ui-components/components/artworks/ArtworkCard";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { ArtworkSchemaTypes } from "@omenai/shared-types";

export default function ArtworkListing({
  artworks,
}: {
  artworks: ArtworkSchemaTypes[];
}) {
  const { user } = useAuth({ requiredRole: "user" });
  const { width } = useWindowSize();

  if (!artworks || artworks.length === 0) {
    return (
      <div className="flex h-[400px] w-full flex-col items-center justify-center rounded-lg border border-dashed border-neutral-200 bg-neutral-50">
        <div className="scale-75 opacity-60">
          <NotFoundData />
        </div>
        <p className="mt-4 font-sans text-sm font-medium text-neutral-400">
          No works listed in the archive yet.
        </p>
      </div>
    );
  }

  // Column logic: Matches standard marketplace grid
  const columns = width <= 640 ? 1 : width <= 990 ? 2 : width <= 1440 ? 3 : 4;
  const arts = catalogChunk(artworks, columns);

  return (
    <div className="w-full">
      <div className="flex flex-wrap justify-center gap-x-8">
        {arts.map((column: any[], colIndex) => {
          return (
            <div className="flex flex-1 flex-col gap-12" key={colIndex}>
              {column.map((art: any) => {
                return (
                  <ArtworkCard
                    key={art.art_id}
                    image={art.url}
                    name={art.title}
                    artist={art.artist}
                    art_id={art.art_id}
                    pricing={art.pricing}
                    impressions={art.impressions}
                    likeIds={art.like_IDs}
                    sessionId={user ? user.id : undefined}
                    availability={art.availability}
                    medium={art.medium}
                    author_id={art.author_id}
                  />
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
