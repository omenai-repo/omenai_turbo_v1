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
export default function Home() {
  const { user } = useAuth({ requiredRole: "user" });

  console.log(user);

  const { data: promotionals, isLoading } = useQuery({
    queryKey: ["home"],
    queryFn: async () => {
      const promotionals = await getPromotionalData();
      if (!promotionals?.isOk) throw new Error("Something went wrong");
      return promotionals.data;
    },
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

        {promotionals && <Hero promotionals={promotionals} />}

        <LatestArtworkWrapper
          sessionId={user && user.role === "user" ? user.id : undefined}
        />
        <Collections />
        <TrendingArtworkWrapper
          sessionId={user && user.role === "user" ? user.id : undefined}
        />
        <Editorials />
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
      <Footer />
    </main>
  );
}
