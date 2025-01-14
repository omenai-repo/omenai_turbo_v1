"use client";

import { fetchSingleArtwork } from "@omenai/shared-services/artworks/fetchSingleArtwork";
import { IndividualSchemaTypes, UserType } from "@omenai/shared-types";
import DesktopNavbar from "@omenai/shared-ui-components/components/navbar/desktop/DesktopNavbar";
import { useQuery } from "@tanstack/react-query";
import ArtistInformation from "./components/ArtistInformation";
import FullArtworkDetails from "./components/FullArtworkDetails";
import ProductBox from "./components/ProductBox";
import SimilarArtworks from "./components/SimilarArtworks";
import SimilarArtworksByArtist from "./components/SimilarArtworksByArtist";
import Load from "@omenai/shared-ui-components/components/loader/Load";
import Footer from "@omenai/shared-ui-components/components/footer/Footer";

export default function ArtworkPageWrapper({
  param,
  session,
}: {
  param: string;
  session: UserType | undefined;
}) {
  const { data: artworkDetails, isLoading } = useQuery({
    queryKey: ["fetch_single_artwork_data"],
    queryFn: async () => {
      const artworkDetails = await fetchSingleArtwork(param);
      if (!artworkDetails?.isOk) {
        console.log(artworkDetails);
      } else {
        return artworkDetails.data;
      }
    },
  });

  if (isLoading) {
    return <Load />;
  }
  return (
    <div>
      <div className="">
        <DesktopNavbar />

        <div className="p-2 md:p-8">
          <ProductBox
            data={artworkDetails}
            sessionId={
              (session as IndividualSchemaTypes)?.role === "user"
                ? (session as IndividualSchemaTypes)?.user_id
                : undefined
            }
          />
          <hr className="border-dark/10" />
          <ArtistInformation
            name={artworkDetails.artist}
            year={artworkDetails.artist_birthyear}
            location={artworkDetails.artist_country_origin}
          />
          <SimilarArtworks
            title={artworkDetails.title}
            sessionId={
              (session as IndividualSchemaTypes)?.role === "user"
                ? (session as IndividualSchemaTypes)?.user_id
                : undefined
            }
            medium={artworkDetails.medium}
          />
          <SimilarArtworksByArtist
            sessionId={
              (session as IndividualSchemaTypes)?.role === "user"
                ? (session as IndividualSchemaTypes)?.user_id
                : undefined
            }
            artist={artworkDetails.artist}
          />
        </div>

        <Footer />
      </div>
    </div>
  );
}
