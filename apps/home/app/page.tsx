"use client";
import DesktopNavbar from "@omenai/shared-ui-components/components/navbar/desktop/DesktopNavbar";
import Editorials from "./features/editorials/Editorials";
import CuratedArtworkClientWrapper from "./features/curated/CuratedArtworkClientWrapper";
import Footer from "@omenai/shared-ui-components/components/footer/Footer";
import Collections from "./features/collections/Collections";
import { getPromotionalData } from "@omenai/shared-services/promotionals/getPromotionalContent";
import Hero from "./features/hero/Hero";
import { useQuery } from "@tanstack/react-query";
import LatestArtworkWrapper from "./features/latest/LatestArtworkWrapper";
import TrendingArtworkWrapper from "./features/trending/TrendingrtworksWrapper";
import RecentViewWrapper from "./features/recentViews/RecentViewWrapper";

import AppStoreAd from "./features/appStoreAd/AppStoreAd";
import Load from "@omenai/shared-ui-components/components/loader/Load";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import TrendingArtistWrapper from "./features/trendingArtists/TrendingArtistWrapper";
import Newsletter from "./Newsletter";

import { useFeatureFlag } from "configcat-react";
export default function Home() {
  const { user } = useAuth({ requiredRole: "user" });
  const { value: isMyNewFeatureEnabled } = useFeatureFlag(
    "showmynewfeature",
    false
  );

  const { data: promotionals, isLoading } = useQuery({
    queryKey: ["home"],
    queryFn: async () => {
      const promotionals = await getPromotionalData();
      if (!promotionals?.isOk) throw new Error("Something went wrong");
      return promotionals.data;
    },
    staleTime: 60 * 60 * 1000, // Data is fresh for 5 minutes
    gcTime: 60 * 60 * 1000, // Keep in cache for 30 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false, // Don't refetch if we have cached data
  });

  if (isLoading) {
    return (
      <div className="w-full h-screen grid place-items-center">
        <Load />
      </div>
    );
  }

  return (
    <main>
      <div>
        <DesktopNavbar />

        {isMyNewFeatureEnabled ? (
          promotionals && <Hero promotionals={promotionals} />
        ) : (
          <>
            <div className="w-full grid place-items-center p-5 bg-dark text-white">
              <p>Sorry, this feature is disabled at the moment</p>
            </div>
          </>
        )}

        <LatestArtworkWrapper
          sessionId={user && user.role === "user" ? user.id : undefined}
        />
        <Collections />
        <TrendingArtworkWrapper
          sessionId={user && user.role === "user" ? user.id : undefined}
        />
        <Editorials />
        <TrendingArtistWrapper />
        {user && user.role === "user" && (
          <CuratedArtworkClientWrapper
            sessionId={user && user.role === "user" ? user.id : undefined}
          />
        )}
        {user && user.role === "user" && (
          <RecentViewWrapper
            sessionId={user && user.role === "user" ? user.id : undefined}
          />
        )}
      </div>
      <div className="my-6">
        <AppStoreAd />
      </div>
      <div className="my-6">
        <Newsletter />
      </div>
      <Footer />
    </main>
  );
}
