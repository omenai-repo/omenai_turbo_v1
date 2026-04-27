module.exports = {
  async up(db, client) {
    // Note: Verify these collection names exactly match your database.
    // Mongoose usually lowercases and pluralizes model names.
    const ARTISTS_COLLECTION = "accountartists";
    const ARTWORKS_COLLECTION = "artworkuploads";

    console.log(
      "Starting migration: Backfilling Artist birthyear and country_of_origin...",
    );

    // STEP 1: Set the baseline.
    // Ensure every artist document at least has the empty string placeholders.
    await db.collection(ARTISTS_COLLECTION).updateMany(
      {},
      {
        $set: {
          birthyear: "",
          country_of_origin: "",
        },
      },
    );
    console.log("Step 1 complete: Default placeholders added to all artists.");

    // STEP 2: Extract the data from the Artworks collection.
    // We use an aggregation pipeline to group by the artist's name so we
    // don't waste time processing 50 duplicate updates for the same person.
    const artworkDataCursor = db.collection(ARTWORKS_COLLECTION).aggregate([
      {
        $match: {
          // Only pull artworks that actually have this data
          artist_birthyear: { $exists: true, $ne: "" },
          artist_country_origin: { $exists: true, $ne: "" },
        },
      },
      {
        $group: {
          _id: "$artist", // Group by the artist string name
          birthyear: { $first: "$artist_birthyear" },
          country_of_origin: { $first: "$artist_country_origin" },
        },
      },
    ]);

    let updatedCount = 0;

    // STEP 3: Map the data over to the Artists collection.
    for await (const doc of artworkDataCursor) {
      const result = await db.collection(ARTISTS_COLLECTION).updateOne(
        { name: doc._id }, // Match the string name from the artwork to the artist profile
        {
          $set: {
            birthyear: doc.birthyear,
            country_of_origin: doc.country_of_origin,
          },
        },
      );

      if (result.modifiedCount > 0) {
        updatedCount++;
      }
    }

    console.log(
      `Step 2 & 3 complete: Successfully backfilled data for ${updatedCount} artists.`,
    );
  },

  async down(db, client) {
    const ARTISTS_COLLECTION = "accountartists";

    console.log(
      "Rolling back migration: Removing birthyear and country_of_origin from Artists...",
    );

    // The rollback simply deletes those two fields from the Artist collection entirely.
    // It leaves the Artwork collection completely untouched, returning the DB to its exact prior state.
    await db.collection(ARTISTS_COLLECTION).updateMany(
      {},
      {
        $unset: {
          birthyear: "",
          country_of_origin: "",
        },
      },
    );

    console.log("Rollback complete.");
  },
};
