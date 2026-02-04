import React from "react";
import { useWindowSize } from "usehooks-ts";
import { catalogChunk } from "@omenai/shared-utils/src/createCatalogChunks";
import ArtworkCard from "@omenai/shared-ui-components/components/artworks/ArtworkCard";
import { ArtworkSchemaTypes } from "@omenai/shared-types";

interface ArtworkGridProps {
  artworks: ArtworkSchemaTypes[];
  sessionId?: string;
  renderArtworkWrapper?: (
    artwork: ArtworkSchemaTypes,
    child: React.ReactNode,
  ) => React.ReactNode;
  filterByRole?: "gallery" | "artist";
}

export function ArtworkGrid({
  artworks,
  sessionId,
  renderArtworkWrapper,
  filterByRole,
}: ArtworkGridProps) {
  const { width } = useWindowSize();

  const arts = catalogChunk(
    artworks,
    width <= 640 ? 1 : width <= 990 ? 2 : width <= 1440 ? 3 : 4,
  );

  return (
    <div className="w-full my-3">
      <div className="flex flex-wrap gap-x-4 justify-center">
        {arts.map((artworkChunk: ArtworkSchemaTypes[], index) => {
          return (
            <div className="flex-1 gap-2 space-y-6" key={index}>
              {artworkChunk
                .filter((art) =>
                  filterByRole ? art.role_access.role === filterByRole : true,
                )
                .map((art) => {
                  const artworkCard = (
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

                  return renderArtworkWrapper ? (
                    <React.Fragment key={art.art_id}>
                      {renderArtworkWrapper(art, artworkCard)}
                    </React.Fragment>
                  ) : (
                    artworkCard
                  );
                })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
