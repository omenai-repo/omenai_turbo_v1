import DesktopNavbar from "@omenai/shared-ui-components/components/navbar/desktop/DesktopNavbar";
import { collections } from "../collectionConstants";
import ArtCollectionCard from "./components/ArtCollectionCard";
import Footer from "@omenai/shared-ui-components/components/footer/Footer";

export const dynamic = "force-dynamic";

export default function page() {
  return (
    <div className="min-h-screen bg-white">
      <DesktopNavbar />

      <main className="container mx-auto px-6 lg:px-12 pt-8 pb-32">
        {/* 1. THE INDEX HEADER */}
        <div className="mb-20 border-b border-black pb-8 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-neutral-500 mb-4 block">
              Department Index
            </span>
            <h1 className="font-serif text-6xl md:text-8xl italic text-dark leading-[0.9]">
              Curated <br /> Collections.
            </h1>
          </div>

          <p className="max-w-xs font-sans text-xs leading-relaxed text-neutral-500 text-right">
            Dive into diverse art lineages, thoughtfully curated to trace the
            history and future of each medium.
          </p>
        </div>

        {/* 2. THE BOOKSHELF (Grid) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
          {collections.map((collection, index) => (
            <ArtCollectionCard
              key={index}
              index={index}
              title={collection.title}
              url={collection.url}
            />
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
