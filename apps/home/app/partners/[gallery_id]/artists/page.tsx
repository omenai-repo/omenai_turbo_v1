import React from "react";
import GalleryArtistsPage from "./components/GalleryArtistsPage";

export default async function page({
  params,
}: {
  params: Promise<{ gallery_id: string }>;
}) {
  const { gallery_id } = await params;
  return <GalleryArtistsPage galleryId={gallery_id} />;
}
