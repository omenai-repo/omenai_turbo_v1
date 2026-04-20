module.exports = {
  async up(db, client) {
    const ARTISTS_COLLECTION = "accountartists";

    console.log(
      "Starting Final Migration: Initializing 'claimed' status for legacy artists...",
    );

    // CRITICAL: We only target documents where 'profile_status' does NOT exist yet.
    // This protects the 'ghost' artists generated in the previous step.
    const result = await db
      .collection(ARTISTS_COLLECTION)
      .updateMany(
        { profile_status: { $exists: false } },
        { $set: { profile_status: "claimed" } },
      );

    console.log(
      `Success! Updated ${result.modifiedCount} legacy artists to 'claimed' status.`,
    );
  },

  async down(db, client) {
    const ARTISTS_COLLECTION = "accountartists";

    console.log("Rolling back profile_status for legacy artists...");

    // We only unset the ones we marked as 'claimed', leaving the ghosts intact
    const result = await db
      .collection(ARTISTS_COLLECTION)
      .updateMany(
        { profile_status: "claimed" },
        { $unset: { profile_status: "" } },
      );

    console.log(
      `Rollback complete. Removed 'claimed' status from ${result.modifiedCount} artists.`,
    );
  },
};
