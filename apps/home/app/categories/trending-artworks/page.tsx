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
      <div className="p-4">
        <div className="space-y-1 px-4 my-5">
          <h1 className="text-sm md:text-md font-normal">Trending artworks</h1>
          <p className="text-base md:text-sm text-[#858585] font-light italic">
            On the Rise: Discover the Art Everyone&apos;s Talking About
          </p>
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
