"use client";

import ArtworkCard from "@omenai/shared-ui-components/components/artworks/ArtworkCard";
import { catalogChunk } from "@omenai/shared-utils/src/createCatalogChunks";
import { useWindowSize } from "usehooks-ts";

export default function LatestArtworks({
  artworks,
  sessionId,
}: {
  artworks: any;
  sessionId: string | undefined;
}) {
  const { width } = useWindowSize();

  const arts = catalogChunk(
    artworks,
    width <= 640 ? 1 : width <= 990 ? 2 : width <= 1440 ? 3 : 4,
  );

  return (
    <div className="relative w-full">
      {artworks.length > 0 && (
        <div className="flex flex-wrap gap-x-6 justify-center">
          {arts.map((artworksColumn: any[], index) => {
            return (
              <div className="flex-1 flex flex-col gap-8" key={index}>
                {artworksColumn.map((art: any) => {
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
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
