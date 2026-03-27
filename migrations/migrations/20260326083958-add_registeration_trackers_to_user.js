// Location: migrations/XXXXXXXXXXXXXX-add-registration-tracking-to-users.js

module.exports = {
  async up(db, client) {
    const defaultTracking = {
      ip_address: "Unknown",
      country: "Unknown",
      city: "Unknown",
      device_type: "unknown",
      os: "Unknown",
      browser: "Unknown",
      referrer: "legacy",
    };

    // Note: Verify these match your exact MongoDB Atlas collection names.
    // Mongoose usually lowercases and pluralizes the model names automatically.
    const collections = [
      "accountindividuals",
      "accountartists",
      "accountgalleries",
    ];

    for (const collectionName of collections) {
      await db.collection(collectionName).updateMany(
        // The Filter: ONLY update documents that don't have this field yet.
        // This prevents overwriting fresh users if they sign up during the deployment window.
        { registration_tracking: { $exists: false } },
        // The Update: Inject the default tracking object
        { $set: { registration_tracking: defaultTracking } },
      );
    }

    console.log("Migration UP successful: Injected legacy tracking data.");
  },

  async down(db, client) {
    const collections = [
      "accountindividuals",
      "accountartists",
      "accountgalleries",
    ];

    for (const collectionName of collections) {
      await db.collection(collectionName).updateMany(
        // The Filter: To be incredibly safe, we only roll back documents
        // that we explicitly tagged as "legacy". We leave organically tracked users alone.
        { "registration_tracking.referrer": "legacy" },
        // The Rollback: Remove the field entirely
        { $unset: { registration_tracking: "" } },
      );
    }

    console.log("Migration DOWN successful: Removed legacy tracking data.");
  },
};
