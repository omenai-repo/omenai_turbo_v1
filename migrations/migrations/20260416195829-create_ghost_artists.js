const crypto = require("crypto");

module.exports = {
  async up(db, client) {
    const ARTWORKS_COLLECTION = "artworkuploads";
    const ARTISTS_COLLECTION = "accountartists";
    const GALLERIES_COLLECTION = "accountgalleries";

    console.log(
      "Starting Phase 2 Migration: Mapping Gallery Artworks to Artists...",
    );

    // 1. Get all artworks uploaded by galleries that haven't been mapped yet
    const artworksCursor = db.collection(ARTWORKS_COLLECTION).find({
      "role_access.role": "gallery",
      artist_id: "",
    });

    // We use a Map to cache artist IDs so we don't create duplicates
    // if a gallery uploaded multiple works by the same unmapped artist.
    const artistIdCache = new Map();

    let processedCount = 0;
    let newGhostsCreated = 0;
    let existingMappedCount = 0;

    for await (const artwork of artworksCursor) {
      // Safely extract the string name they typed in the old system
      const artistName = artwork.artist ? artwork.artist.trim() : null;

      if (!artistName) {
        console.warn(`Skipping artwork ${artwork._id}: No artist name found.`);
        continue;
      }

      const lowerName = artistName.toLowerCase();
      let finalArtistId = artistIdCache.get(lowerName);

      // If we haven't processed this name yet during this script run
      if (!finalArtistId) {
        // Look for them in the actual database (exact, case-insensitive match)
        const existingArtist = await db.collection(ARTISTS_COLLECTION).findOne({
          name: { $regex: new RegExp(`^${artistName}$`, "i") },
        });

        if (existingArtist && existingArtist.artist_id) {
          finalArtistId = existingArtist.artist_id;
          existingMappedCount++;
        } else {
          // ==========================================
          // GHOST GENERATION
          // ==========================================
          finalArtistId = crypto.randomUUID();

          const newGhost = {
            name: artistName,
            profile_status: "ghost",
            artist_id: finalArtistId,
            verified: false,
            artist_verified: false,
            isOnboardingCompleted: false,
            role: "artist",
            base_currency: "USD",
            logo: "",
            bio: "",
            art_style: [],
            address: {
              country: "",
              city: "",
              state: "",
              zipCode: "",
              zip: "",
              countryCode: "",
              stateCode: "",
            },
            birthyear: "", // Including the fields from our earlier migration!
            country_of_origin: "",
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          await db.collection(ARTISTS_COLLECTION).insertOne(newGhost);
          newGhostsCreated++;
        }

        // Save to our short-term cache to speed up subsequent loops
        artistIdCache.set(lowerName, finalArtistId);
      }

      // ==========================================
      // RELATIONAL MAPPING
      // ==========================================

      // 1. Update the Artwork Document
      await db
        .collection(ARTWORKS_COLLECTION)
        .updateOne(
          { _id: artwork._id },
          { $set: { artist_id: finalArtistId } },
        );

      // 2. Add to Gallery's Roster (Using $addToSet prevents duplicates)
      if (artwork.author_id) {
        await db
          .collection(GALLERIES_COLLECTION)
          .updateOne(
            { gallery_id: artwork.author_id },
            { $addToSet: { represented_artists: finalArtistId } },
          );
      }

      processedCount++;
    }

    console.log(`Phase 2 Complete!`);
    console.log(`- Artworks successfully mapped: ${processedCount}`);
    console.log(`- Mapped to existing artists: ${existingMappedCount}`);
    console.log(`- New Ghost Artists created: ${newGhostsCreated}`);
  },

  async down(db, client) {
    const ARTWORKS_COLLECTION = "artworkuploads";
    const GALLERIES_COLLECTION = "accountgalleries";
    const ARTISTS_COLLECTION = "accountartists";

    console.log("Rolling back Phase 2 Migration...");

    // 1. Reset all Gallery artwork artist_id fields back to empty strings
    await db
      .collection(ARTWORKS_COLLECTION)
      .updateMany(
        { "role_access.role": "gallery" },
        { $set: { artist_id: "" } },
      );

    // 2. Clear out all the gallery rosters
    await db
      .collection(GALLERIES_COLLECTION)
      .updateMany({}, { $set: { represented_artists: [] } });

    // 3. Clean up the ghosts (Deletes any artist that has the strict "ghost" status)
    const deleteResult = await db.collection(ARTISTS_COLLECTION).deleteMany({
      profile_status: "ghost",
    });

    console.log(
      `Rollback Complete. Removed ${deleteResult.deletedCount} ghost artists.`,
    );
  },
};
