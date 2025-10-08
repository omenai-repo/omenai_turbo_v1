export async function up(db, client) {
  // TODO write your migration here.
  // See https://github.com/seppevs/migrate-mongo/#creating-a-new-migration-script
  // Example:
  // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: true}});
  await db
    .collection("purchasetransactions")
    .updateMany(
      { trans_recipient_role: "artist" },
      { $set: { "trans_pricing.penalty_fee": 0 } }
    );
}

/**
 * @param db {import('mongodb').Db}
 * @param client {import('mongodb').MongoClient}
 * @returns {Promise<void>}
 */
export async function down(db, client) {
  // TODO write the statements to rollback your migration (if possible)
  // Example:
  // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
  await db
    .collection("purchasetransactions")
    .updateMany(
      { trans_recipient_role: "artist" },
      { $unset: { "trans_pricing.penalty_fee": "" } }
    );
}
