import PageTitle from "../components/PageTitle";
import ArtCatalog from "./components/ArtCatalog";
export const dynamic = "force-dynamic";

export default async function MyArtworks() {
  // const artworks = await getAllArtworksById();
  return (
    <div className="w-full h-full">
      <PageTitle title="My Artworks" />
      <ArtCatalog />
    </div>
  );
}
