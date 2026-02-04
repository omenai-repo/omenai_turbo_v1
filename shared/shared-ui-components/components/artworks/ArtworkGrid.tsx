import React from "react";
import { useWindowSize } from "usehooks-ts";
import { catalogChunk } from "@omenai/shared-utils/src/createCatalogChunks";
import ArtworkCard from "@omenai/shared-ui-components/components/artworks/ArtworkCard";
import { ArtworkSchemaTypes } from "@omenai/shared-types";

interface ArtworkGridProps {
  artworks: ArtworkSchemaTypes[];
  sessionId?: string;
  handleDownload?: (url: string, title: string) => void;
}

export function ArtworkGrid({
  artworks,
  sessionId,
  handleDownload,
}: ArtworkGridProps) {
  const { width } = useWindowSize();

  const arts = catalogChunk(
    artworks,
    width <= 640 ? 1 : width <= 990 ? 2 : width <= 1440 ? 3 : 4,
  );

  return (
    <div className="w-full my-3">
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
                    sessionId={sessionId}
                    availability={art.availability}
                    medium={art.medium}
                    author_id={art.author_id}
                    isDashboard={false}
                    isAdmin={true}
                    handleDownload={handleDownload}
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
