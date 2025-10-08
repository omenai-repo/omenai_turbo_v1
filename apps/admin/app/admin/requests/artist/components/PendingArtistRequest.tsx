import React from "react";
import { ArtistType } from "./ArtistRequestWrapper";
import ArtistRequest from "./ArtistRequest";

export default function PendingArtistRequests({
  artists,
}: {
  artists: ArtistType[];
}) {
  return (
    <>
      {artists.length === 0 ? (
        <div className="h-[80vh] grid place-items-center">
          <div className="flex flex-col items-center gap-1">
            <p className="text-dark text-fluid-xxs font-medium">
              No pending Artist requests
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col space-y-4">
          {artists.map((artist) => {
            return (
              <ArtistRequest
                key={artist.artist_id}
                artist={artist}
                tab="pending"
              />
            );
          })}
        </div>
      )}
    </>
  );
}
