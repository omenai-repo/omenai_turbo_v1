import z from "zod";

export const UploadArtworkSchema = z
  .object({
    author_id: z.string(),
    title: z.string(),
    artist: z.string(),
    pricing: z.object({
      price: z.number(),
      usd_price: z.number(),
      shouldShowPrice: z.string(),
      currency: z.string(),
    }),
    dimensions: z.object({
      height: z.string(),
      width: z.string(),
      weight: z.string().optional(),
    }),
    materials: z.string(),
    medium: z.string(),
    year: z.number(),
    rarity: z.string(),
    url: z.string(),
    artist_birthyear: z.string(),
    artist_country_origin: z.string(),
    certificate_of_authenticity: z.string(),
    artwork_description: z.string(),
    signature: z.string(),
    packaging_type: z.string(),
    role_access: z.object({
      role: z.string(),
      designation: z.string().nullable(),
    }),
    image_format: z
      .object({
        ratio: z.string(),
        orientation: z.enum(["portrait", "landscape", "square"]),
      })
      .nullable(),
    newGhostArtistName: z.string().optional(),
    artist_id: z.string().optional(),
  })
  .refine(
    (data) => {
      // Fails if BOTH are missing. They must provide one or the other.
      if (!data.artist_id && !data.newGhostArtistName) {
        return false;
      }
      return true;
    },
    {
      message:
        "You must either select an existing artist or provide a name to create a new one.",
      path: ["artist_id"],
    },
  );

export type UploadArtworkInput = z.infer<typeof UploadArtworkSchema>;
