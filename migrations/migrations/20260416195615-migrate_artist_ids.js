module.exports = {
  async up(db, client) {
    const ARTWORKS_COLLECTION = "artworkuploads";
    const GALLERIES_COLLECTION = "accountgalleries";

    console.log(
      "Starting Migration: Artwork artist_id mapping and Gallery roster init...",
    );

    // ==========================================
    // TASK 1: Handle Artwork artist_id fields
    // ==========================================

    // 1A. For Artists: Copy author_id into artist_id
    // The [] brackets enable the aggregation pipeline allowing us to reference "$author_id"
    const artistUpdate = await db
      .collection(ARTWORKS_COLLECTION)
      .updateMany({ "role_access.role": "artist" }, [
        { $set: { artist_id: "$author_id" } },
      ]);
    console.log(
      `Updated ${artistUpdate.modifiedCount} artworks uploaded by Artists.`,
    );

    // 1B. For Galleries: Initialize artist_id as an empty string (to be mapped later)
    const galleryArtworkUpdate = await db
      .collection(ARTWORKS_COLLECTION)
      .updateMany(
        { "role_access.role": "gallery" },
        { $set: { artist_id: "" } },
      );
    console.log(
      `Initialized ${galleryArtworkUpdate.modifiedCount} artworks uploaded by Galleries.`,
    );

    // ==========================================
    // TASK 2: Initialize Gallery Represented Artists
    // ==========================================

    const galleryUpdate = await db
      .collection(GALLERIES_COLLECTION)
      .updateMany({}, { $set: { represented_artists: [] } });
    console.log(
      `Initialized represented_artists array for ${galleryUpdate.modifiedCount} galleries.`,
    );

    console.log("Migration complete.");
  },

  async down(db, client) {
    const ARTWORKS_COLLECTION = "artworkuploads";
    const GALLERIES_COLLECTION = "accountgalleries";

    console.log("Rolling back migration...");

    // Remove the artist_id field from all artworks
    await db
      .collection(ARTWORKS_COLLECTION)
      .updateMany({}, { $unset: { artist_id: "" } });

    // Remove the represented_artists array from all galleries
    await db
      .collection(GALLERIES_COLLECTION)
      .updateMany({}, { $unset: { represented_artists: "" } });

    console.log("Rollback complete.");
  },
};
