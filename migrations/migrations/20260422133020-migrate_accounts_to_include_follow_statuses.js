// migrations/YYYYMMDDHHMMSS-add-follow-counts.js

module.exports = {
  async up(db, client) {
    console.log("Starting migration: Adding follow count fields...");

    // 1. Update Users (accountindividuals) - Add followingCount
    const individualsResult = await db
      .collection("accountindividuals")
      .updateMany(
        { followingCount: { $exists: false } }, // Only update if the field doesn't exist yet
        { $set: { followingCount: 0 } },
      );
    console.log(
      `Updated ${individualsResult.modifiedCount} accountindividuals.`,
    );

    // 2. Update Artists (accountartists) - Add followerCount
    const artistsResult = await db
      .collection("accountartists")
      .updateMany(
        { followerCount: { $exists: false } },
        { $set: { followerCount: 0 } },
      );
    console.log(`Updated ${artistsResult.modifiedCount} accountartists.`);

    // 3. Update Galleries (accountgalleries) - Add followerCount
    const galleriesResult = await db
      .collection("accountgalleries")
      .updateMany(
        { followerCount: { $exists: false } },
        { $set: { followerCount: 0 } },
      );
    console.log(`Updated ${galleriesResult.modifiedCount} accountgalleries.`);

    console.log("Migration completed successfully.");
  },

  async down(db, client) {
    console.log("Rolling back migration: Removing follow count fields...");

    // 1. Revert Users
    await db
      .collection("accountindividuals")
      .updateMany({}, { $unset: { followingCount: "" } });

    // 2. Revert Artists
    await db
      .collection("accountartists")
      .updateMany({}, { $unset: { followerCount: "" } });

    // 3. Revert Galleries
    await db
      .collection("accountgalleries")
      .updateMany({}, { $unset: { followerCount: "" } });

    console.log("Rollback completed successfully.");
  },
};
