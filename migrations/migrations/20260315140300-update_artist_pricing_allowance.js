import { toUTCDate } from "../utils/toUtcDate.ts";

export async function up(db, client) {
  const session = client.startSession();

  try {
    await session.withTransaction(async () => {
      // Calculate 1 month from now
      const now = new Date();

      await db.collection("accountartists").updateMany(
        {},
        {
          $set: {
            pricing_allowances: {
              auto_approvals_used: 0,
              last_reset_date: toUTCDate(now),
            },
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
      await db.collection("accountartists").updateMany(
        {},
        {
          $unset: { pricing_allowances: "" },
        },
        { session },
      );
    });
  } finally {
    await session.endSession();
  }
}
