"use client";
import React from "react";
import notFound from "../../../not-found";
import { getGalleryProfile } from "@omenai/shared-services/partners/getGalleryProfile";
import { useQuery } from "@tanstack/react-query";
import { GalleryNav } from "./GalleryNav";
import { GalleryHero } from "./GalleryHero";
import Load from "@omenai/shared-ui-components/components/loader/Load";

export default function GalleryWrapper({ galleryId }: { galleryId: string }) {
  // Direct server-side DB call to get the layout data
  const { data: gallery, isLoading } = useQuery({
    queryKey: ["galleryProfile", galleryId],
    queryFn: async () => {
      const response = await getGalleryProfile(galleryId);
      if (!response.isOk || !response.data) {
        notFound(); // Bails out to the 404 page if the gallery doesn't exist
      }
      return response.data;
    },
  });

  if (isLoading) return <Load />;

  return (
    <div className="relative">
      <GalleryHero gallery={gallery} />
      <GalleryNav galleryId={galleryId} />
    </div>
  );
}
