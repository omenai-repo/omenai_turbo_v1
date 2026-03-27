module.exports = {
  async up(db, client) {
    console.log("Starting migration: Backfilling acceptedAt timestamps...");

    // Find all accepted createorders missing the acceptedAt timestamp
    const cursor = db.collection("createorders").find({
      "order_accepted.status": "accepted",
      "order_accepted.acceptedAt": { $exists: false },
    });

    const bulkOps = [];
    const SEVENTY_TWO_HOURS_IN_MS = 72 * 60 * 60 * 1000;

    while (await cursor.hasNext()) {
      const order = await cursor.next();

      // Fallback to Date.now() just in case an old order is missing createdAt
      const baseDate = order.createdAt
        ? new Date(order.createdAt).getTime()
        : Date.now();

      // Generate a random time between 0 and 72 hours
      const randomOffset = Math.floor(Math.random() * SEVENTY_TWO_HOURS_IN_MS);
      const simulatedAcceptedAt = new Date(baseDate + randomOffset);

      bulkOps.push({
        updateOne: {
          filter: { _id: order._id },
          update: {
            $set: { "order_accepted.acceptedAt": simulatedAcceptedAt },
          },
        },
      });

      // Batch execute every 500 documents to prevent blowing up your RAM
      if (bulkOps.length >= 500) {
        await db.collection("createorders").bulkWrite(bulkOps);
        bulkOps.length = 0; // Clear the array
      }
    }

    // Flush any remaining operations
    if (bulkOps.length > 0) {
      await db.collection("createorders").bulkWrite(bulkOps);
    }

    console.log("Migration complete: acceptedAt timestamps added.");
  },

  async down(db, client) {
    console.log("Rolling back migration: Removing acceptedAt timestamps...");

    // WARNING: This unsets acceptedAt for ALL createorders.
    // If you run this rollback months from now, it will delete legitimate data too.
    await db
      .collection("createorders")
      .updateMany(
        { acceptedAt: { $exists: true } },
        { $unset: { "order_accepted.acceptedAt": "" } },
      );

    console.log("Rollback complete.");
  },
};
