"use client";

import { fetchSingleArtwork } from "@omenai/shared-services/artworks/fetchSingleArtwork";
import DesktopNavbar from "@omenai/shared-ui-components/components/navbar/desktop/DesktopNavbar";
import { useQuery } from "@tanstack/react-query";
import ArtistInformation from "./components/ArtistInformation";
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
    queryKey: ["fetch_single_artwork_data"],
    queryFn: async () => {
      const artworkDetails = await fetchSingleArtwork(param);
      if (!artworkDetails?.isOk) {
      } else {
        return artworkDetails.data;
      }
    },
    staleTime: 10 * 60 * 1000, // Individual artworks can be cached longer
    gcTime: 60 * 60 * 1000, // Keep for 1 hour
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    enabled: !!param, // Only fetch if we have a param id
  });

  if (isLoading) {
    return <Load />;
  }

  return (
    <div className="relative">
      <div>
        <DesktopNavbar />

        <div className="my-5">
          <ProductBox
            data={artworkDetails}
            sessionId={user ? user.id : undefined}
          />
          <hr className="border-dark/10 my-5" />
          <div className="grid sm:grid-cols-2 gap-6">
            <FullArtworkDetails data={artworkDetails} />

            <ArtistInformation
              name={artworkDetails.artist}
              year={artworkDetails.artist_birthyear}
              location={artworkDetails.artist_country_origin}
            />
          </div>
        </div>
        <SimilarArtworks
          title={artworkDetails.title}
          sessionId={user ? user.id : undefined}
          medium={artworkDetails.medium}
        />
        <SimilarArtworksByArtist
          sessionId={user ? user.id : undefined}
          artist={artworkDetails.artist}
        />

        <Footer />
      </div>
    </div>
  );
}
