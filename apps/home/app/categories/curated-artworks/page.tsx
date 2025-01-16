import { ArtworkListing } from "./components/ArtworksListing";
import Filter from "../components/filters/Filter";
import DesktopNavbar from "@omenai/shared-ui-components/components/navbar/desktop/DesktopNavbar";
import { getServerSession } from "@omenai/shared-utils/src/checkSessionValidity";
import { IndividualSchemaTypes } from "@omenai/shared-types";

export default async function CuratedArtworks() {
  const session = await getServerSession();

  return (
    <main className="relative">
      <DesktopNavbar />
      <div>
        <div className="space-y-1 my-5">
          <p className="text-lg lg:text-xl font-semibold">
            Your Art, Your Way:
          </p>
          <p className=" font-medium">Discover Captivating Pieces </p>
          <p className=" font-medium">that truly resonates with You</p>
        </div>
        <Filter page_type="curated" />
        <ArtworkListing
          sessionId={
            (session as IndividualSchemaTypes)?.role === "user"
              ? (session as IndividualSchemaTypes)?.user_id
              : undefined
          }
        />
      </div>
    </main>
  );
}
