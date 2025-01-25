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
import ZoomableViewerModal from "./modals/ZoomableViewerModal";
import { actionStore } from "@omenai/shared-state-store/src/actions/ActionStore";
import dynamic from "next/dynamic";

export default function ArtworkPageWrapper({
  param,
  session,
}: {
  param: string;
  session: UserType | undefined;
}) {
  const { seaDragonZoomableImageViewerUrl } = actionStore();
  const { data: artworkDetails, isLoading } = useQuery({
    queryKey: ["fetch_single_artwork_data"],
    queryFn: async () => {
      const artworkDetails = await fetchSingleArtwork(param);
      if (!artworkDetails?.isOk) {
      } else {
        return artworkDetails.data;
      }
    },
    gcTime: 0,
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
            sessionId={
              (session as IndividualSchemaTypes)?.role === "user"
                ? (session as IndividualSchemaTypes)?.user_id
                : undefined
            }
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

        <Footer />
      </div>
    </div>
  );
}
