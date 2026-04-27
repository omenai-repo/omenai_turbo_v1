import React from "react";
import GalleryContactPage from "./GalleryContactWrapper";

export default async function page({
  params,
}: {
  params: Promise<{ gallery_id: string }>;
}) {
  const { gallery_id } = await params;
  return <GalleryContactPage galleryId={gallery_id} />;
}
