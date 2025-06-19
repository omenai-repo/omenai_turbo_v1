"use client";
import AllArtworks from "./components/AllArtworks";
import Collections from "../features/collections/Collections";
import DesktopNavbar from "@omenai/shared-ui-components/components/navbar/desktop/DesktopNavbar";
import Footer from "@omenai/shared-ui-components/components/footer/Footer";
import AppStoreAd from "../features/appStoreAd/AppStoreAd";
import Filter from "./components/Filter";

export default function page() {
  if (typeof window === "undefined") {
    return null; // or loading component
  }
  return (
    <main className="relative" suppressHydrationWarning>
      <DesktopNavbar />
      <div className="">
        <Collections isCatalog={true} />
      </div>

      {/* <Hero /> */}
      <div className="">
        <Filter />
        <AllArtworks />
        <AppStoreAd />
        <Footer />
      </div>
    </main>
  );
}
