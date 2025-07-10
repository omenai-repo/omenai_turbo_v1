import PageTitle from "../components/PageTitle";
import ArtCatalog from "./components/ArtCatalog";
export const dynamic = "force-dynamic";

export default function page() {
  return (
    <div className="w-full h-full">
      <PageTitle title="My Artworks" />
      <ArtCatalog />
    </div>
  );
}
