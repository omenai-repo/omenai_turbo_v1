"use client";
import DesktopNavbar from "@omenai/shared-ui-components/components/navbar/desktop/DesktopNavbar";

import Editorials from "./features/editorials/Editorials";
import CuratedArtworkClientWrapper from "./features/curated/CuratedArtworkClientWrapper";
import Footer from "@omenai/shared-ui-components/components/footer/Footer";
import Collections from "./features/collections/Collections";
import { getPromotionalData } from "@omenai/shared-services/promotionals/getPromotionalContent";
import Hero from "./features/hero/Hero";
import { useQuery } from "@tanstack/react-query";
import { IndividualLogo } from "@omenai/shared-ui-components/components/logo/Logo";
import HomeLoader from "@omenai/shared-ui-components/components/loader/HomeLoader";
import LatestArtworkWrapper from "./features/latest/LatestArtworkWrapper";
import TrendingArtworkWrapper from "./features/trending/TrendingrtworksWrapper";
import RecentViewWrapper from "./features/recentViews/RecentViewWrapper";
import { useContext } from "react";
import { SessionContext } from "@omenai/package-provider/SessionProvider";
import { IndividualSchemaTypes } from "@omenai/shared-types";
import AppStoreAd from "./features/appStoreAd/AppStoreAd";
import { HomeLoad } from "@omenai/shared-ui-components/components/loader/Load";
export default function Home() {
  const { session } = useContext(SessionContext);
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
        <HomeLoad />
      </div>
    );
  }

  return (
    <main>
      <div>
        <DesktopNavbar />

        {promotionals && <Hero promotionals={promotionals} />}

        <LatestArtworkWrapper
          sessionId={
            (session as IndividualSchemaTypes)?.role === "user"
              ? (session as IndividualSchemaTypes)?.user_id
              : undefined
          }
        />
        <Collections />
        <TrendingArtworkWrapper
          sessionId={
            (session as IndividualSchemaTypes)?.role === "user"
              ? (session as IndividualSchemaTypes)?.user_id
              : undefined
          }
        />
        <Editorials />
        {session !== undefined && session.role === "user" && (
          <CuratedArtworkClientWrapper
            sessionId={
              session.role === "user"
                ? (session as IndividualSchemaTypes)?.user_id
                : undefined
            }
          />
        )}
        <RecentViewWrapper
          sessionId={
            (session as IndividualSchemaTypes)?.role === "user"
              ? (session as IndividualSchemaTypes)?.user_id
              : undefined
          }
        />
        {/* <Footer /> */}
      </div>
      <AppStoreAd />
      <Footer />
    </main>
  );
}
