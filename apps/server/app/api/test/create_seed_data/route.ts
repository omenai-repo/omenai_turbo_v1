import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { PlatformEvents } from "@omenai/shared-models/models/analytics/PlatformEventsSchema";
import crypto from "crypto";

// Helper to get a random date within the last 90 days
const getRandomDateLast90Days = () => {
  const now = new Date();
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(now.getDate() - 89); // Safely inside the TTL window

  const start = ninetyDaysAgo.getTime();
  const end = now.getTime();
  const offset = crypto.randomInt(0, end - start + 1);

  return new Date(start + offset);
};

export async function GET(request: Request) {
  // SAFETY CHECK: Never run this in production!
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Cannot seed in production environment." },
      { status: 403 },
    );
  }

  try {
    // Ensure DB connection (Replace with your actual DB connection utility if you have one)
    if (mongoose.connection.readyState !== 1) {
      if (!process.env.MONGODB_URI) throw new Error("Missing MONGODB_URI");
      await mongoose.connect(process.env.MONGODB_URI);
    }

    // 1. CLEAR EXISTING DATA (Optional, but good for a clean slate)
    await PlatformEvents.deleteMany({
      event_type: {
        $in: ["por_inquiry", "artwork_saved", "checkout_initiated"],
      },
    });

    // 2. MOCK ARTWORK IDs
    // These MUST be valid 24-character hex strings so $toObjectId doesn't crash
    const mockArtworks = [
      "64a7c9f8e4b0a1b2c3d4e5f0", // E.g., "Symphony in Blue"
      "64a7c9f8e4b0a1b2c3d4e5f1", // E.g., "Urban Echoes"
      "64a7c9f8e4b0a1b2c3d4e5f2",
      "64a7c9f8e4b0a1b2c3d4e5f3",
      "64a7c9f8e4b0a1b2c3d4e5f4",
    ];

    const mockEvents = [];
    const eventTypes = ["por_inquiry", "artwork_saved", "checkout_initiated"];

    // 3. GENERATE 150 RANDOM EVENTS
    for (let i = 0; i < 150; i++) {
      // Create a realistic funnel weight: mostly saves, some PORs, fewer checkouts
      const rand = crypto.randomInt(0, 1000000) / 1000000;
      let type = "artwork_saved";
      if (rand > 0.6) type = "por_inquiry";
      if (rand > 0.85) type = "checkout_initiated";

      mockEvents.push({
        event_type: type,
        session_id: `mock-session-${crypto.randomInt(0, 10000)}`,
        user_id: `mock-user-${crypto.randomInt(0, 50)}`, // Simulate some returning users
        art_id: mockArtworks[crypto.randomInt(0, mockArtworks.length)],
        tracking_data: {
          ip_address: "127.0.0.1",
          country: "Nigeria", // Hardcoding to your current location for realism
          city: "Lagos",
          device_type: crypto.randomInt(0, 2) === 0 ? "desktop" : "mobile",
          os: "macOS",
          browser: "Chrome",
          referrer: "direct",
        },
        createdAt: getRandomDateLast90Days(), // Overriding Mongoose timestamps
      });
    }

    // 4. INSERT INTO MONGODB
    await PlatformEvents.insertMany(mockEvents);

    return NextResponse.json({
      success: true,
      message: `Successfully seeded ${mockEvents.length} events across the last 90 days.`,
      breakdown: {
        saves: mockEvents.filter((e) => e.event_type === "artwork_saved")
          .length,
        pors: mockEvents.filter((e) => e.event_type === "por_inquiry").length,
        checkouts: mockEvents.filter(
          (e) => e.event_type === "checkout_initiated",
        ).length,
      },
    });
  } catch (error: any) {
    console.error("Seeding Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
