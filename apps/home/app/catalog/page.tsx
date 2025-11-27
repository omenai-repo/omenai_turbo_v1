"use client";
import AllArtworks from "./components/AllArtworks";
import Collections from "../features/collections/Collections";
import DesktopNavbar from "@omenai/shared-ui-components/components/navbar/desktop/DesktopNavbar";
import Footer from "@omenai/shared-ui-components/components/footer/Footer";
import AppStoreAd from "../features/appStoreAd/AppStoreAd";
import { FilterDrawerProvider } from "./filter-v2/FilterDrawerProvider";
import ActiveFilterPills from "./filter-v2/ActiveFilterPills";
import FilterDrawer from "./filter-v2/FilterDrawer";
import FilterToggleButton from "./filter-v2/FilterToggleButton";

export default function page() {
  return (
    <main className="relative" suppressHydrationWarning>
      <DesktopNavbar />
      <div className="">
        <Collections isCatalog={true} />
      </div>

      {/* <Hero /> */}
      <div className="">
        {/* <Filter /> */}
        <FilterDrawerProvider>
          <div className="flex justify-between items-center gap-x-4 mb-4">
            <FilterToggleButton />
            <ActiveFilterPills />
          </div>

          <FilterDrawer />
          <AllArtworks />
        </FilterDrawerProvider>
        <AppStoreAd />
        <Footer />
      </div>
    </main>
  );
}
