import z from "zod";

export const AddArtistToRosterSchema = z
  .object({
    artist_id: z.string().optional(),
    newGhostData: z
      .object({
        name: z.string().min(2, "Name must be at least 2 characters"),
        birthyear: z.string().optional(),
        country_of_origin: z.string().optional(),
      })
      .optional(),
  })
  .refine((data) => data.artist_id || data.newGhostData, {
    message:
      "You must provide either an existing artist ID or data to create a new artist.",
  });

export type AddArtistToRosterInput = z.infer<typeof AddArtistToRosterSchema>;
