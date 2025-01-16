import { ArtworkListing } from "./components/ArtworksListing";
import Filter from "../components/filters/Filter";
import DesktopNavbar from "@omenai/shared-ui-components/components/navbar/desktop/DesktopNavbar";
import { getServerSession } from "@omenai/shared-utils/src/checkSessionValidity";
import { IndividualSchemaTypes } from "@omenai/shared-types";
// import Filter from "./components/Filter";

export default async function TrendingArtworks() {
  const session = await getServerSession();

  return (
    <main className="relative">
      <DesktopNavbar />
      <div className="py-4">
        <div className="space-y-1 my-5">
          <p className="text-lg lg:text-xl font-semibold">On the rise</p>
          <p className=" font-medium">
            Discover the Art Everyone&apos;s Talking About
          </p>
          {/* <p className=" font-medium"></p> */}
        </div>
        <Filter page_type="trending" />

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
