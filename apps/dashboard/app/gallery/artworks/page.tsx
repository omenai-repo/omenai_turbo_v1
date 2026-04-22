import Link from "next/link";
import PageTitle from "../components/PageTitle";
import ArtCatalog from "./components/ArtCatalog";
import { IoAdd } from "react-icons/io5";
export const dynamic = "force-dynamic";

export default async function MyArtworks() {
  return (
    <div className="w-full h-full">
      {/* <PageTitle title="My Artworks" /> */}
      <div className="flex justify-between items-center">
        <div className="flex flex-col">
          <h1 className="text-2xl font-normal tracking-tight text-dark">
            Artwork catalog
          </h1>
          <p className="text-sm text-neutral-500 mt-2 tracking-wide">
            Manage your art catalog
          </p>
        </div>
        <Link href={"/gallery/artworks/upload"} className="w-fit">
          <button className="h-[35px] p-4 rounded-sm  w-full flex items-center justify-center gap-3 disabled:cursor-not-allowed disabled:bg-dark/10 disabled:text-[#A1A1A1] bg-dark text-white text-fluid-xxs font-normal whitespace-nowrap">
            <span>Upload Artwork</span>
            <IoAdd className="text-fluid-sm" />
          </button>
        </Link>
      </div>
      <ArtCatalog />
    </div>
  );
}
