import {
  ArtworkUploadStateTypes,
  ArtworkSchemaTypes,
} from "@omenai/shared-types";

export function createUploadedArtworkData(
  data: ArtworkUploadStateTypes,
  url: string,
  id: string
): Omit<
  ArtworkSchemaTypes,
  "art_id" | "should_show_on_sub_active" | "availability"
> {
  const updatedArwordData: Omit<ArtworkSchemaTypes, "art_id" | "availability"> =
    {
      artist: data.artist,
      dimensions: {
        height: data.height,
        width: data.width,
        depth: data.depth,
        weight: data.weight,
      },
      pricing: {
        price: +data.price,
        usd_price: +data.usd_price,
        shouldShowPrice: data.shouldShowPrice,
        currency: data.currency,
      },
      materials: data.materials,
      medium: data.medium,
      year: +data.year,
      title: data.title,
      rarity: data.rarity,
      url,
      gallery_id: id,
      artist_birthyear: data.artist_birthyear,
      artist_country_origin: data.artist_country_origin,
      certificate_of_authenticity: data.certificate_of_authenticity,
      artwork_description: data.artwork_description,
      framing: data.framing,
      signature: data.signature,
    };

  return updatedArwordData;
}
