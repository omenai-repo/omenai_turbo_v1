"use client";
import DesktopNavbar from "@omenai/shared-ui-components/components/navbar/desktop/DesktopNavbar";
import Filter from "../components/filters/Filter";
import { ArtworkListing } from "./components/ArtworksListing";
import { IndividualSchemaTypes } from "@omenai/shared-types";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
// import Filter from "./components/Filter";

export default function RecentArtworks() {
  const { user } = useAuth({ requiredRole: "user" });

  return (
    <main className="relative">
      <DesktopNavbar />
      <div className="p-4">
        <div className="space-y-1 my-5 px-4">
          <h1 className="text-fluid-sm md:text-fluid-md font-normal">
            Latest artworks
          </h1>
          <p className="text-fluid-base md:text-fluid-sm text-[#858585] font-light italic">
            Fresh Off the Easel: Explore the Newest Masterpieces, Just for You
          </p>
        </div>
        <Filter page_type="recent" />
        <ArtworkListing
          sessionId={user && user.role === "user" ? user.id : undefined}
        />
      </div>
    </main>
  );
}
