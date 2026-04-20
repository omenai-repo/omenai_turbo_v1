import { AccountGallery } from "@omenai/shared-models/models/auth/GallerySchema";
import { AccountArtist } from "@omenai/shared-models/models/auth/ArtistSchema"; // Assuming this exists
import { GalleryEvent } from "@omenai/shared-models/models/events/GalleryEventSchema";
import { Artworkuploads } from "@omenai/shared-models/models/artworks/UploadArtworkSchema";

export async function getGalleryOverviewService(gallery_id: string) {
  try {
    // 1. Fetch the core gallery data (Description + Represented IDs)
    const gallery = (await AccountGallery.findOne(
      { gallery_id },
      "description represented_artists",
    ).lean()) as { description: string; represented_artists: string[] } | null;

    if (!gallery) return { isOk: false, message: "Gallery not found" };

    const representedIds = gallery.represented_artists || [];

    // 2. Run the heavy lifting concurrently
    const [representedArtists, availableArtworksAggregation, events] =
      await Promise.all([
        // Fetch Represented Artist Names
        AccountArtist.find(
          { artist_id: { $in: representedIds } },
          "artist_id name",
        ).lean(),

        // Aggregate Artworks to find distinct artists (who have uploaded works by this gallery)
        Artworkuploads.aggregate([
          // 1. Match works where this gallery is the uploader
          { $match: { author_id: gallery_id } },
          // 2. Group by the actual artist's ID to get distinct names
          {
            $group: {
              _id: "$artist_id",
              name: { $first: "$artist" },
            },
          },
        ]),

        // Fetch all published events by this gallery, newest first
        GalleryEvent.find({
          gallery_id,
          is_published: true,
          is_archived: false,
        })
          .sort({ start_date: -1 })
          .select(
            "event_id title event_type cover_image start_date end_date location",
          )
          .lean(),
      ]);

    // 3. Filter "Works Available By" to exclude anyone already in "Represented"
    // Filter "Works Available By" to exclude anyone already in "Represented"
    const representedIdsSet = new Set(
      representedIds.map((id) => id.toString()),
    );

    const availableArtists = availableArtworksAggregation
      .filter((art) => art._id && !representedIdsSet.has(art._id.toString()))
      .map((art) => ({ artist_id: art._id, name: art.name }));

    return {
      isOk: true,
      data: {
        description: gallery.description,
        represented_artists: representedArtists,
        available_artists: availableArtists,
        events: events,
      },
    };
  } catch (error) {
    console.error("Gallery Overview Error:", error);
    return { isOk: false, message: "Internal Server Error" };
  }
}
