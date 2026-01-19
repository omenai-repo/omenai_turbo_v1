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
import { artworkStore } from "@omenai/shared-state-store/src/artworks/ArtworkStore";

export default function CatalogWrapper() {
  const { artwork_total } = artworkStore();
  return (
    <main className="relative bg-white min-h-screen" suppressHydrationWarning>
      <DesktopNavbar />

      {/* 1. THE ARCHIVE HEADER */}
      <header className=" pb-12 max-w-[1800px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end gap-8">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-6">
              <span className="w-8 h-[1px] bg-dark"></span>
              <span className="text-[10px] font-bold tracking-[0.4em] uppercase text-neutral-400">
                Global Archive
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-serif leading-[1.1] text-dark">
              Curating <span className="italic">creativity</span> <br />
              <span className="text-neutral-300">&</span> design in the digital
              realm.
            </h1>
          </div>

          {/* Metadata/Stats block - Adds "Atelier" technical feel */}
          <div className="hidden lg:block text-right border-l border-neutral-100 pl-12 pb-2">
            <p className="text-[10px] font-mono text-neutral-400 uppercase tracking-tighter mb-1">
              Status
            </p>
            <p className="text-xs font-bold uppercase tracking-widest text-dark mb-4">
              Our catalog
            </p>
            <p className="text-[10px] font-mono text-neutral-400 uppercase tracking-tighter mb-1">
              Volume
            </p>
            <p className="text-xs font-bold uppercase tracking-widest text-dark">
              {Math.floor(artwork_total / 10) * 10}+ Works
            </p>
          </div>
        </div>
      </header>

      {/* 2. SECONDARY NAVIGATION (The "Collections" Archive) */}
      {/* <section className="bg-neutral-50/50 border-y border-neutral-100 mb-12">
        <div className="max-w-[1800px] mx-auto">
          <Collections isCatalog={true} />
        </div>
      </section> */}

      {/* 3. STUDIO CONTROLS (Filters) */}
      <FilterDrawerProvider>
        <div className="max-w-[1800px] mx-auto">
          {/* Refined Filter Bar */}
          <div className=" z-20 bg-white/80 backdrop-blur-md py-4 border-b border-neutral-100 flex flex-wrap items-center justify-between gap-4 mb-12">
            <div className="flex items-center gap-6">
              <FilterToggleButton />
              <div className="h-4 w-[1px] bg-neutral-200 hidden md:block"></div>
              <ActiveFilterPills />
            </div>
          </div>

          <FilterDrawer />

          {/* 4. THE GRID */}
          <div className="pb-24">
            <AllArtworks />
          </div>
        </div>
      </FilterDrawerProvider>

      <AppStoreAd />
      <Footer />
    </main>
  );
}
