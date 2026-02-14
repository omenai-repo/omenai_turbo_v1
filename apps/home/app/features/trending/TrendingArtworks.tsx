"use client";

import TrendingArtworkCard from "./TrendingArtCard";

export default function TrendingArtworks({
  sessionId,
  artworks,
}: {
  artworks: any;
  sessionId: string | undefined;
}) {
  return (
    <div className="relative w-full">
      {artworks.length > 0 && (
        // STRICT CSS GRID: Ensures all columns are equal width
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          {artworks.map((art: any) => {
            return (
              <TrendingArtworkCard
                key={art.art_id}
                image={art.url}
                name={art.title}
                artist={art.artist}
                impressions={art.impressions as number}
                medium={art.medium}
                rarity={art.rarity}
                likeIds={art.like_IDs as string[]}
                sessionId={sessionId}
                art_id={art.art_id}
                availability={art.availability}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
