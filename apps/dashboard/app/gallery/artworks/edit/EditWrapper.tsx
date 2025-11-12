"use client";
import { notFound, useSearchParams } from "next/navigation";
import PageTitle from "../../components/PageTitle";
import { useQuery } from "@tanstack/react-query";
import { fetchSingleArtwork } from "@omenai/shared-services/artworks/fetchSingleArtwork";

import EditArtworkWrapper from "./components/EditArtworkWrapper";
import Load from "@omenai/shared-ui-components/components/loader/Load";
import { Suspense } from "react";

export default function EditArtwork() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const { data: artwork, isLoading } = useQuery({
    queryKey: ["get_update_pricing_artwork_details"],
    queryFn: async () => {
      if (id === null) return notFound();
      const art_id = decodeURIComponent(id);

      const data = await fetchSingleArtwork(art_id);
      if (!data?.isOk) throw new Error("Something went wrong");
      return data.data;
    },
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return (
      <div className="h-[85vh] w-full grid place-items-center">
        <Load />
      </div>
    );
  }

  console.log(artwork);
  return (
    <Suspense>
      <PageTitle title="Edit artwork Price" />
      <EditArtworkWrapper artwork={artwork} />
    </Suspense>
  );
}
