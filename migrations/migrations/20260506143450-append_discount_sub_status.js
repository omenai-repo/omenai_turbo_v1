module.exports = {
  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async up(db, client) {
    await db
      .collection("subscriptions")
      .updateMany({}, { $set: { isDiscountSub: false } });
    await db
      .collection("accountgalleries")
      .updateMany(
        {},
        { $set: { "subscription_status.discount.isDiscountSub": false } },
      );
  },

  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async down(db, client) {
    await db
      .collection("subscriptions")
      .updateMany({}, { $set: { isDiscountSub: false } });
    await db
      .collection("accountgalleries")
      .updateMany(
        {},
        { $set: { "subscription_status.discount.isDiscountSub": false } },
      );
  },
};
