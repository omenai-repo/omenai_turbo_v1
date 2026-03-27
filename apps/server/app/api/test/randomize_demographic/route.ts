import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { AccountArtist } from "@omenai/shared-models/models/auth/ArtistSchema";
import { AccountGallery } from "@omenai/shared-models/models/auth/GallerySchema";
import { AccountIndividual } from "@omenai/shared-models/models/auth/IndividualSchema";

// 1. THE WEIGHTED DISTRIBUTIONS
const COUNTRIES = [
  { value: "Nigeria", weight: 35 },
  { value: "United States", weight: 25 },
  { value: "United Kingdom", weight: 15 },
  { value: "France", weight: 10 },
  { value: "Germany", weight: 5 },
  { value: "South Africa", weight: 5 },
  { value: "Japan", weight: 5 },
];

const DEVICES = [
  { value: "mobile", weight: 60 },
  { value: "desktop", weight: 35 },
  { value: "tablet", weight: 5 },
];

const REFERRERS = [
  { value: "instagram", weight: 40 },
  { value: "organic_search", weight: 30 },
  { value: "direct", weight: 15 },
  { value: "artsy_referral", weight: 10 },
  { value: "twitter", weight: 5 },
];

// Helper function to pick a value based on its weight
function getWeightedRandom(items: { value: string; weight: number }[]) {
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  let random = Math.random() * totalWeight;

  for (const item of items) {
    if (random < item.weight) return item.value;
    random -= item.weight;
  }
  return items[0].value;
}

export async function GET(request: Request) {
  // SAFETY LOCK: Prevent accidental wipes in production
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Migration locked in production." },
      { status: 403 },
    );
  }

  try {
    if (mongoose.connection.readyState !== 1) {
      if (!process.env.MONGODB_URI) throw new Error("Missing MONGODB_URI");
      await mongoose.connect(process.env.MONGODB_URI);
    }

    const modelsToMigrate = [
      { name: "Collectors", model: AccountIndividual },
      { name: "Artists", model: AccountArtist },
      { name: "Galleries", model: AccountGallery },
    ];

    const migrationResults = [];

    // 2. THE CORRECTED LOOP
    for (const { name, model } of modelsToMigrate) {
      // Safety check in case the model hasn't been initialized properly
      if (!model) {
        console.warn(
          `[Migration Warning]: Model for ${name} is undefined. Skipping.`,
        );
        continue;
      }

      // Fetch only the IDs to save memory during the migration
      const documents = await model.find({}, { _id: 1 }).lean();

      if (!documents || documents.length === 0) {
        migrationResults.push({ collection: name, updated: 0 });
        continue;
      }

      // Prepare bulk update operations
      const bulkOps = documents.map((doc: any) => {
        const device = getWeightedRandom(DEVICES);

        const os =
          device === "mobile"
            ? getWeightedRandom([
                { value: "iOS", weight: 60 },
                { value: "Android", weight: 40 },
              ])
            : getWeightedRandom([
                { value: "macOS", weight: 70 },
                { value: "Windows", weight: 30 },
              ]);

        return {
          updateOne: {
            filter: { _id: doc._id },
            update: {
              $set: {
                registration_tracking: {
                  country: getWeightedRandom(COUNTRIES),
                  city: "Unknown",
                  device_type: device,
                  os: os,
                  browser: os === "iOS" || os === "macOS" ? "Safari" : "Chrome",
                  referrer: getWeightedRandom(REFERRERS),
                },
              },
            },
          },
        };
      });

      // Execute bulk write for maximum performance
      const result = await model.bulkWrite(bulkOps);
      migrationResults.push({
        collection: name,
        updated: result.modifiedCount,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Demographic migration complete.",
      results: migrationResults,
    });
  } catch (error: any) {
    console.error("[Migration Error]:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
