import {
  ArtworkUploadStateTypes,
  ArtworkSchemaTypes,
  RoleAccess,
} from "@omenai/shared-types";

export function createUploadedArtworkData(
  data: ArtworkUploadStateTypes,
  url: string,
  id: string,
  role_access: RoleAccess,
  image_format: ArtworkSchemaTypes["image_format"],
): Omit<
  ArtworkSchemaTypes,
  "art_id" | "should_show_on_sub_active" | "availability" | "exclusivity_status"
> {
  const updatedArwordData: Omit<
    ArtworkSchemaTypes,
    "art_id" | "availability" | "exclusivity_status"
  > & { artist_id?: string; newGhostArtistName?: string } = {
    artist: data.artist,
    artist_id: data.artist_id || "",
    newGhostArtistName: data.newGhostArtistName || "",
    dimensions: {
      height: data.height,
      width: data.width,
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
    author_id: id,
    artist_birthyear: data.artist_birthyear,
    artist_country_origin: data.artist_country_origin,
    certificate_of_authenticity: data.certificate_of_authenticity,
    artwork_description: data.artwork_description,
    signature: data.signature,
    packaging_type: data.packaging_type,
    role_access,
    image_format,
  };

  return updatedArwordData;
}
