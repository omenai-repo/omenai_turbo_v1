import { toUTCDate } from "../utils/toUtcDate.ts";

export async function up(db, client) {
  function addDaysToDate(days, backDate) {
    const result = new Date(backDate);
    result.setDate(result.getDate() + days);
    return toUTCDate(result);
  }

  const session = client.startSession();

  try {
    await session.withTransaction(async () => {
      // Add exclusivity_uphold_status to all accountartists documents
      await db.collection("accountartists").updateMany(
        {},
        {
          $set: {
            exclusivity_uphold_status: {
              isBreached: false,
              incident_count: 0,
            },
          },
        },
        { session }
      );

      const currentDate = toUTCDate(new Date());
      const bulkOrderWrites = [];
      const bulkArtworkWrites = [];

      // Process artworks in cursor to avoid loading all into memory
      const cursor = db.collection("artworkuploads").find({});

      for await (const artwork of cursor) {
        if (!artwork.createdAt || !artwork.art_id) {
          continue;
        }

        const exclusivityEndDate = addDaysToDate(90, artwork.createdAt);
        const isExclusive = exclusivityEndDate >= currentDate;

        const exclusivityStatus = {
          exclusivity_type:
            artwork.role_access.role === "gallery"
              ? null
              : isExclusive
                ? "exclusive"
                : "non-exclusive",
          exclusivity_end_date:
            artwork.role_access.role === "gallery" ? null : exclusivityEndDate,
        };

        // Prepare CreateOrders bulk write
        bulkOrderWrites.push({
          updateOne: {
            filter: { "artwork_data.art_id": artwork.art_id },
            update: {
              $set: {
                "artwork_data.exclusivity_status": exclusivityStatus,
              },
            },
          },
        });

        // Prepare Artworkuploads bulk write
        bulkArtworkWrites.push({
          updateOne: {
            filter: { art_id: artwork.art_id },
            update: {
              $set: {
                exclusivity_status: {
                  ...exclusivityStatus,
                  order_auto_rejection_count: 0,
                },
              },
            },
          },
        });
      }

      // Execute bulk writes
      if (bulkOrderWrites.length > 0) {
        const result = await db
          .collection("createorders")
          .bulkWrite(bulkOrderWrites, { session });
      }

      if (bulkArtworkWrites.length > 0) {
        const result = await db
          .collection("artworkuploads")
          .bulkWrite(bulkArtworkWrites, { session });
      }
    });
  } finally {
    await session.endSession();
  }
}

export async function down(db, client) {
  const session = client.startSession();

  try {
    await session.withTransaction(async () => {
      // Remove exclusivity_uphold_status from accountartists (fixed collection name)
      await db.collection("accountartists").updateMany(
        {},
        {
          $unset: { exclusivity_uphold_status: "" },
        },
        { session }
      );

      // Remove exclusivity_status from CreateOrders
      await db
        .collection("createorders")
        .updateMany(
          {},
          { $unset: { "artwork_data.exclusivity_status": "" } },
          { session }
        );

      // Remove exclusivity_status from Artworkuploads
      await db
        .collection("artworkuploads")
        .updateMany({}, { $unset: { exclusivity_status: "" } }, { session });
    });
  } finally {
    await session.endSession();
  }
}
