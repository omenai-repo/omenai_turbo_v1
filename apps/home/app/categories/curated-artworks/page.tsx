"use client";
import { ArtworkListing } from "./components/ArtworksListing";
import Filter from "../components/filters/Filter";
import DesktopNavbar from "@omenai/shared-ui-components/components/navbar/desktop/DesktopNavbar";
import { IndividualSchemaTypes } from "@omenai/shared-types";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";

export default function CuratedArtworks() {
  const { user } = useAuth({ requiredRole: "user" });

  return (
    <main className="relative">
      <DesktopNavbar />
      <div>
        <div className="space-y-1 my-5">
          <p className="text-fluid-lg lg:text-fluid-xl font-semibold">
            Your Art, Your Way:
          </p>
          <p className=" font-medium">Discover Captivating Pieces </p>
          <p className=" font-medium">that truly resonates with You</p>
        </div>
        <Filter page_type="curated" />
        <ArtworkListing
          sessionId={user && user.role === "user" ? user.id : undefined}
        />
      </div>
    </main>
  );
}
