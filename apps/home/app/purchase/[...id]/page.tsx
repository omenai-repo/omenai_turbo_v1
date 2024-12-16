import { fetchSingleArtworkOnPurchase } from "@omenai/shared-services/artworks/fetchSingleArtworkOnPurchase";
import PurchaseComponentWrapper from "./components/PurchaseComponentWrapper";

export default async function page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const slug = (await params).id;
  const artwork = await fetchSingleArtworkOnPurchase(decodeURIComponent(slug));
  if (!artwork?.isOk) throw new Error("Something went wrong");

  return <PurchaseComponentWrapper artwork={artwork.data} />;
}
