"use client";

import { fetchSingleArtwork } from "@omenai/shared-services/artworks/fetchSingleArtwork";
import DesktopNavbar from "@omenai/shared-ui-components/components/navbar/desktop/DesktopNavbar";
import { useQuery } from "@tanstack/react-query";
import { ArtistInformation } from "./components/ArtistInformation";
import FullArtworkDetails from "./components/FullArtworkDetails";
import ProductBox from "./components/ProductBox";
import SimilarArtworks from "./components/SimilarArtworks";
import SimilarArtworksByArtist from "./components/SimilarArtworksByArtist";
import Load from "@omenai/shared-ui-components/components/loader/Load";
import Footer from "@omenai/shared-ui-components/components/footer/Footer";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";

export default function ArtworkPageWrapper({ param }: { param: string }) {
  const { user } = useAuth({ requiredRole: "user" });

  const { data: artworkDetails, isLoading } = useQuery({
    queryKey: ["fetch_single_artwork_data", param],
    queryFn: async () => {
      const artworkDetails = await fetchSingleArtwork(param);
      if (!artworkDetails?.isOk) {
        throw new Error("Failed to fetch artwork");
      } else {
        return artworkDetails.data;
      }
    },
    staleTime: 0,
    gcTime: 0,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    enabled: !!param,
  });

  if (isLoading) {
    return <Load />;
  }

  return (
    <div className="min-h-screen bg-white text-dark relative">
      <DesktopNavbar />

      {/* MAIN VIEWING ROOM LAYOUT */}
      <main className="container mx-auto px-6 lg:px-12 pt-4 pb-24">
        {/* The ProductBox now handles the Split Layout internally for better cohesion */}
        <ProductBox
          data={artworkDetails}
          sessionId={user ? user.id : undefined}
        />

        {/* SECONDARY INFORMATION (Below Fold) */}
        <div className="mt-24 grid grid-cols-1 lg:grid-cols-12 gap-12 border-t border-neutral-200 pt-12">
          {/* Left Column: Technical Details */}
          <div className="lg:col-span-7 space-y-12">
            <FullArtworkDetails data={artworkDetails} />
          </div>

          {/* Right Column: Artist Bio */}
          <div className="lg:col-span-5">
            <ArtistInformation
              name={artworkDetails.artist}
              year={artworkDetails.artist_birthyear}
              location={artworkDetails.artist_country_origin}
            />
          </div>
        </div>

        {/* CURATED SUGGESTIONS */}
        <div className="mt-32 space-y-24">
          <SimilarArtworks
            title={artworkDetails.title}
            sessionId={user ? user.id : undefined}
            medium={artworkDetails.medium}
          />
          <SimilarArtworksByArtist
            sessionId={user ? user.id : undefined}
            artist={artworkDetails.artist}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}
