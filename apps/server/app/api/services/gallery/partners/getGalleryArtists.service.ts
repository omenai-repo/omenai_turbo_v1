// @omenai/shared-services/gallery/getGalleryArtists.ts

import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { AccountGallery } from "@omenai/shared-models/models/auth/GallerySchema";
import { AccountArtist } from "@omenai/shared-models/models/auth/ArtistSchema";
import { Artworkuploads } from "@omenai/shared-models/models/artworks/UploadArtworkSchema";
import { fetchArtworksFromCache } from "../../../artworks/utils";
import { ArtistSchemaTypes } from "@omenai/shared-types";

export async function getGalleryArtistsService(
  gallery_id: string,
  page: number = 1,
  limit: number = 5,
  singleArtistId?: string,
) {
  try {
    await connectMongoDB();

    // 1. Get the official represented list
    const gallery = (await AccountGallery.findOne(
      { gallery_id },
      "represented_artists",
    ).lean()) as { represented_artists: string[] } | null;
    const representedIds = (gallery?.represented_artists || []).map((id: any) =>
      id.toString(),
    );

    let paginatedIds: string[] = [];
    let total = 0;
    const isRepresentedMap = new Map<string, boolean>();

    // 2. Ultra-strict sanitization: Ensure singleArtistId is a valid string, not "null", "undefined", or empty
    const targetArtist =
      singleArtistId &&
      singleArtistId.trim() !== "" &&
      singleArtistId !== "null" &&
      singleArtistId !== "undefined"
        ? singleArtistId
        : null;

    if (targetArtist) {
      paginatedIds = [targetArtist];
      total = 1;
      isRepresentedMap.set(targetArtist, representedIds.includes(targetArtist));
    } else {
      // 3. THE FIX: Use the exact same Aggregation from the Overview route instead of .distinct()
      const artistsWithWorksRaw = await Artworkuploads.aggregate([
        { $match: { author_id: gallery_id } },
        { $group: { _id: "$artist_id" } },
      ]);

      const artistsWithWorks = artistsWithWorksRaw
        .map((a) => a._id?.toString())
        .filter(Boolean); // Clean out any null/undefined IDs

      // Separate them to maintain hierarchy
      const activeRepresented = representedIds.filter((id: string) =>
        artistsWithWorks.includes(id),
      );
      const activeAvailable = artistsWithWorks.filter(
        (id: string) => !representedIds.includes(id),
      );

      const combined = [...activeRepresented, ...activeAvailable];
      total = combined.length;

      const skip = (page - 1) * limit;
      paginatedIds = combined.slice(skip, skip + limit);

      paginatedIds.forEach((id) => {
        isRepresentedMap.set(id, representedIds.includes(id));
      });

      // === DEBUG LOGS: Check your backend terminal if it still returns 1 ===
      console.log("--- GALLERY ARTISTS FLOOR LOG ---");
      console.log(`Total Artists with Works in DB: ${artistsWithWorks.length}`);
      console.log(`Combined Active Array Length: ${total}`);
      console.log(`Returning Paginated Chunk Length: ${paginatedIds.length}`);
      console.log("---------------------------------");
    }

    // 4. Fetch data for the chunk
    const artistsData = await Promise.all(
      paginatedIds.map(async (artistId) => {
        const [artistInfo, worksTotal, works] = await Promise.all([
          AccountArtist.findOne(
            { artist_id: artistId },
            "name country_of_origin birthyear",
          ).lean() as unknown as Pick<
            ArtistSchemaTypes,
            "name" | "country_of_origin" | "birthyear"
          >,
          Artworkuploads.countDocuments({
            author_id: gallery_id,
            artist_id: artistId,
          }),
          Artworkuploads.find({ author_id: gallery_id, artist_id: artistId })
            .sort({ createdAt: -1 })
            .limit(10)
            .select("art_id")
            .lean(),
        ]);

        const artIds = works.map((w: any) => w.art_id);
        const fullWorks = await fetchArtworksFromCache(artIds);

        return {
          artist_id: artistId,
          name: artistInfo?.name || "Unknown Artist",
          country: artistInfo?.country_of_origin || "",
          birthyear: artistInfo?.birthyear || "",
          isRepresented: isRepresentedMap.get(artistId),
          totalWorks: worksTotal,
          artworks: fullWorks,
        };
      }),
    );

    return {
      isOk: true,
      data: artistsData,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("Gallery Artists Pagination Error:", error);
    return { isOk: false, message: "Internal Server Error" };
  }
}
