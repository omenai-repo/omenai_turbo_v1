// components/upload/ArtistSelect.tsx
"use client";

import React from "react";
import { galleryArtworkUploadStore } from "@omenai/shared-state-store/src/gallery/gallery_artwork_upload/GalleryArtworkUpload";
import {
  SelectedArtistState,
  ArtistAutocomplete,
} from "@omenai/shared-ui-components/components/artists/ArtistAutocomplete";

export const ArtistSelect = () => {
  const { artworkUploadData, updateArtworkUploadData } =
    galleryArtworkUploadStore();

  // Map Zustand store (prefixed names) -> Component format (standard names)
  const currentArtistState: SelectedArtistState = {
    name: artworkUploadData.artist || "",
    artist_id: artworkUploadData.artist_id || "",
    newGhostArtistName: artworkUploadData.newGhostArtistName || "",
    birthyear: artworkUploadData.artist_birthyear || "",
    country_of_origin: artworkUploadData.artist_country_origin || "",
  };

  // Map Component changes (standard names) -> Zustand store (prefixed names)
  const handleStateChange = (newState: SelectedArtistState) => {
    updateArtworkUploadData("artist", newState.name);
    updateArtworkUploadData("artist_id", newState.artist_id);
    updateArtworkUploadData("newGhostArtistName", newState.newGhostArtistName);
    updateArtworkUploadData("artist_birthyear", newState.birthyear);
    updateArtworkUploadData(
      "artist_country_origin",
      newState.country_of_origin,
    );
  };

  return (
    <ArtistAutocomplete
      value={currentArtistState}
      onChange={handleStateChange}
    />
  );
};
