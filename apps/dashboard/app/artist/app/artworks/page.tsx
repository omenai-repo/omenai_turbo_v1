"use client";

import PageTitle from "../components/PageTitle";
import ArtCatalog from "./components/ArtCatalog";

export default function MyArtworks() {
  return (
    <div className="w-full h-full">
      <PageTitle title="My Artworks" />
      <ArtCatalog />
    </div>
  );
}
