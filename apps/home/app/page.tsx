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
import RecentViewWrapper from "./features/recentViews/RecentViewWrapper";

import AppStoreAd from "./features/appStoreAd/AppStoreAd";
import Load from "@omenai/shared-ui-components/components/loader/Load";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import Newsletter from "./Newsletter";
import { FeaturedShowsSection } from "./features/featuredShows/FeaturedShowsSection";
import TrendingArtworkWrapper from "./features/trending/TrendingrtworksWrapper";
import { FairsAndEventsSection } from "./features/events/FairsAndEventSection";
import { FeaturedGalleriesSection } from "./features/featuredGalleries/FeaturedGalleryWrapper";
import { Suspense } from "react";
import CuratorsPicksSection from "./features/curatorPicks/CuratorPicksSelection";
import {
  CuratorsPicksSkeleton,
  FeaturedFeedSkeleton,
} from "./features/curatorPicks/CuratorPicksSkeleton";
import FeaturedFeedSection from "./features/featuredFeed/FeaturedFeedSection";

export default function Home() {
  const { user } = useAuth({ requiredRole: "user" });

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
      <DesktopNavbar />
      {promotionals && <Hero promotionals={promotionals} />}
      <div className="p-4 md:p-8  space-y-16">
        <FeaturedFeedSection />
        <CuratorsPicksSection />
        <FairsAndEventsSection />
        <FeaturedGalleriesSection />
        {/* <LatestArtworkWrapper
          sessionId={user && user.role === "user" ? user.id : undefined}
        /> */}
        <FeaturedShowsSection />
        <Collections />
        <TrendingArtworkWrapper
          sessionId={user && user.role === "user" ? user.id : undefined}
        />
        <Editorials />
        {/* <TrendingArtistWrapper /> */}
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
      <AppStoreAd />
      <Newsletter />
      <Footer />
    </main>
  );
}
