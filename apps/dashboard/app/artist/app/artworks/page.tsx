import PageTitle from "../components/PageTitle";
import ArtCatalog from "./components/ArtCatalog";

export default async function MyArtworks() {
  // const artworks = await getAllArtworksById();
  return (
    <div className="w-full h-full">
      <PageTitle title="My Artworks" />
      <ArtCatalog />
    </div>
  );
}
