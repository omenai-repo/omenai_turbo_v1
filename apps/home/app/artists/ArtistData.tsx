"use client";

import { fetchArtistData } from "@omenai/shared-services/artist/fetchArtistData";
import { useQuery } from "@tanstack/react-query";
import { notFound, useSearchParams } from "next/navigation";
import ArtistInfo from "./ArtistInfo";
import ArtistWorks from "./ArtistWorks";
import Load from "@omenai/shared-ui-components/components/loader/Load";

export default function ArtistData() {
  const params = useSearchParams();
  const id = params.get("id");
  const url = params.get("url");

  if (!id || !url) return notFound();

  const { data: artist_data, isLoading: loading } = useQuery({
    queryKey: [`fetch_artist_data-${id}`],
    queryFn: async () => {
      const response = await fetchArtistData(id, "1");

      if (!response.isOk) throw new Error("Something went wrong");

      return { artist: response.data, artworks: response.artworks };
    },

    staleTime: 30 * 60 * 1000, // Data is fresh for 5 minutes
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false, // Don't refetch if we have cached data
  });

  if (loading) return <Load />;
  return (
    <div className="flex flex-col space-y-12">
      <ArtistInfo loading={loading} info={artist_data?.artist} url={url} />
      <ArtistWorks loading={loading} artworks={artist_data?.artworks} />
    </div>
  );
}
