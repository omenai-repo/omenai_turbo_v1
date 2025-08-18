import DesktopNavbar from "@omenai/shared-ui-components/components/navbar/desktop/DesktopNavbar";
import { collections } from "../collectionConstants";
import ArtCollectionCard from "./components/ArtCollectionCard";
export const dynamic = "force-dynamic";
export default function page() {
  return (
    <main>
      <DesktopNavbar />
      <div className="h-full w-full text-black pt-10 pb-5 px-4 md:px-8 space-y-1">
        <h1 className="text-fluid-sm md:text-fluid-md font-normal">
          Art Collections
        </h1>
        <p className="text-fluid-base md:text-fluid-sm text-[#858585] font-light italic">
          Dive Into Diverse Art Collections, Thoughtfully Curated for Your
          Exploration
        </p>
      </div>
      <div className="px-4 grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3">
        {collections.map((collection, index) => (
          <ArtCollectionCard
            key={index}
            title={collection.title}
            url={collection.url}
          />
        ))}
      </div>
    </main>
  );
}
