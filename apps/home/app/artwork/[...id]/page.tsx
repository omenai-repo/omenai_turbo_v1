import ProductBox from "./components/ProductBox";
import { fetchSingleArtwork } from "@omenai/shared-services/artworks/fetchSingleArtwork";
import SimilarArtworks from "./components/SimilarArtworks";
import { notFound } from "next/navigation";
import FullArtworkDetails from "./components/FullArtworkDetails";
import ArtistInformation from "./components/ArtistInformation";
import SimilarArtworksByArtist from "./components/SimilarArtworksByArtist";
import {
  ArtworkResultTypes,
  IndividualSchemaTypes,
} from "@omenai/shared-types";
import DesktopNavbar from "@omenai/shared-ui-components/components/navbar/desktop/DesktopNavbar";
import { getServerSession } from "@omenai/shared-utils/src/checkSessionValidity";
import { Footer } from "flowbite-react";
import ArtworkPageWrapper from "./ArtworkPageWrapper";

export default async function Artwork_Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const slug = (await params).id;
  const session = await getServerSession();
  const request_param = decodeURIComponent(slug);

  if (slug === undefined) throw new Error("Something went wrong");

  return <ArtworkPageWrapper param={request_param} session={session} />;
}
