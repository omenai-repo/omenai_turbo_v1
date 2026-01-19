"use client";

import { fetchArtistData } from "@omenai/shared-services/artist/fetchArtistData";
import { useQuery } from "@tanstack/react-query";
import { notFound, useSearchParams } from "next/navigation";
import ArtistInfo from "./ArtistInfo";
import ArtistWorks from "./ArtistWorks";
import Load from "@omenai/shared-ui-components/components/loader/Load";
import DesktopNavbar from "@omenai/shared-ui-components/components/navbar/desktop/DesktopNavbar";
import Footer from "@omenai/shared-ui-components/components/footer/Footer";

export default function ArtistData() {
  const params = useSearchParams();
  const id = params.get("id");
  const url = params.get("url");

  if (!id || !url) return notFound();

  const { data: artist_data, isLoading: loading } = useQuery({
    queryKey: ["fetch_artist_data", id],
    queryFn: async () => {
      const response = await fetchArtistData(id, "1");
      if (!response.isOk) throw new Error("Something went wrong");
      return { artist: response.data, artworks: response.artworks };
    },
    staleTime: 30 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  if (loading) return <Load />;

  return (
    <div className="min-h-screen bg-white">
      <DesktopNavbar />

      <main className="container mx-auto px-6 lg:px-12 pt-12 pb-24">
        <div className="flex flex-col gap-24">
          <ArtistInfo loading={loading} info={artist_data?.artist} url={url} />

          <div className="border-t border-neutral-200 pt-12">
            <ArtistWorks loading={loading} artworks={artist_data?.artworks} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
