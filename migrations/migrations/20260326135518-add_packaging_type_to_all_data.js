import { toUTCDate } from "../utils/toUtcDate.ts";

export async function up(db, client) {
  const session = client.startSession();

  try {
    await session.withTransaction(async () => {
      await db.collection("artworkuploads").updateMany(
        { packaging_type: { $exists: false } },
        {
          $set: {
            packaging_type: "rolled",
          },
        },
        { session },
      );
    });
  } finally {
    await session.endSession();
  }
}

export async function down(db, client) {
  const session = client.startSession();

  try {
    await session.withTransaction(async () => {
      // Remove the pricing_allowances field
      await db.collection("artworkuploads").updateMany(
        {},
        {
          $unset: { packaging_type: "" },
        },
        { session },
      );
    });
  } finally {
    await session.endSession();
  }
}
