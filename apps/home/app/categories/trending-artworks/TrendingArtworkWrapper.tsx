"use client";
import { ArtworkListing } from "./components/ArtworksListing";
import Filter from "../components/filters/Filter";
import DesktopNavbar from "@omenai/shared-ui-components/components/navbar/desktop/DesktopNavbar";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";

export default function TrendingArtworks() {
  const { user } = useAuth({ requiredRole: "user" });

  return (
    <main className="relative">
      <DesktopNavbar />
      <div className="py-4">
        <div className="space-y-1 my-5">
          <p className="text-fluid-lg lg:text-fluid-xl font-semibold">
            On the rise
          </p>
          <p className=" font-medium">
            Discover the Art Everyone&apos;s Talking About
          </p>
          {/* <p className=" font-medium"></p> */}
        </div>
        {/* <Filter page_type="trending" /> */}

        <ArtworkListing
          sessionId={user && user.role === "user" ? user.id : undefined}
        />
      </div>
    </main>
  );
}
