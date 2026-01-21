import DesktopNavbar from "@omenai/shared-ui-components/components/navbar/desktop/DesktopNavbar";
import { collections } from "../collectionConstants";
import ArtCollectionCard from "./components/ArtCollectionCard";
import Footer from "@omenai/shared-ui-components/components/footer/Footer";

export const dynamic = "force-dynamic";

export default function page() {
  return (
    <div className="min-h-screen bg-white py-6">
      <DesktopNavbar />

      {/* Added pt-28 to clear the fixed navbar */}
      <main className="container mx-auto">
        {/* 1. THE INDEX HEADER */}
        <div className="mb-16 border-b border-neutral-100 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <span className="font-sans text-xs font-bold uppercase tracking-wider text-dark  mb-3 block">
              Department Index
            </span>
            <h1 className="font-serif text-xl md:text-3xl text-dark  leading-tight">
              Curated Collections
            </h1>
            <p className="mt-4 font-sans text-sm text-neutral-500 max-w-xl leading-relaxed">
              Explore our archive by medium and style. From traditional oil
              paintings to avant-garde digital works, discover pieces that
              define the contemporary landscape.
            </p>
          </div>
        </div>

        {/* 2. THE BOOKSHELF (Grid) */}
        {/* Changed to 4 columns for better density on large screens */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
          {collections.map((collection, index) => (
            // Wrapping in a div to enforce height/ratio consistency if needed
            <div key={collection.title} className="w-full">
              <ArtCollectionCard
                index={index}
                // Removed 'index' prop as it wasn't in the interface defined previously
                title={collection.title}
                url={collection.url}
              />
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
