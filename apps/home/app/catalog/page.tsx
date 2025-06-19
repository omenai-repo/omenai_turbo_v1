"use client";
import AllArtworks from "./components/AllArtworks";
import Collections from "../features/collections/Collections";
import DesktopNavbar from "@omenai/shared-ui-components/components/navbar/desktop/DesktopNavbar";
import Footer from "@omenai/shared-ui-components/components/footer/Footer";
import AppStoreAd from "../features/appStoreAd/AppStoreAd";
import Filter from "./components/Filter";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";

export default function page() {
  const { user } = useAuth({ requiredRole: "user" });
  console.log(user);

  return (
    <main className="relative" suppressHydrationWarning>
      <DesktopNavbar />
      <div className="">
        <Collections isCatalog={true} />
      </div>

      {/* <Hero /> */}
      <div className="">
        <Filter />
        <AllArtworks sessionId={user ? user.id : undefined} />
        <AppStoreAd />
        <Footer />
      </div>
    </main>
  );
}
