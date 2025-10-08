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

  if (!artworks || artworks.length === 0 || artworks.length === 0) {
    return (
      <div className="w-full h-full grid place-items-center my-12">
        <NotFoundData />
      </div>
    );
  }

  const arts = catalogChunk(
    artworks,
    width <= 640 ? 1 : width <= 990 ? 2 : width <= 1440 ? 3 : 4
  );

  return (
    <div className="w-full my-3">
      <p className="text-fluid-xxs font-bold mb-4">
        {artworks.length} artworks:
      </p>

      <div className="flex flex-wrap gap-x-4 justify-center">
        {arts.map((artworks: any[], index) => {
          return (
            <div className="flex-1 gap-2 space-y-6" key={index}>
              {artworks.map((art: any) => {
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
                    sessionId={user ? user.id : undefined}
                    availability={art.availability}
                    medium={art.medium}
                  />
                );
              })}
            </div>
          );
        })}
        {/* first */}
      </div>
    </div>
  );
}
// grid xxm:grid-cols-2 md:grid-cols-3 2lg:grid-cols-4 xl:grid-cols-5 3xl:grid-cols-7 justify-center md:space-y-4 space-x-2 items-end
