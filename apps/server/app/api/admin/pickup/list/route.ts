import { NextResponse } from "next/server";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { FailedPickup } from "@omenai/shared-models/models/crons/FailedPickup";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import {
  standardRateLimit,
  strictRateLimit,
} from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { CombinedConfig } from "@omenai/shared-types";

export const GET = withRateLimitHighlightAndCsrf(standardRateLimit)(
  async function GET(req: Request) {
    try {
      await connectMongoDB();
      const { searchParams } = new URL(req.url);
      const tab = searchParams.get("status") || "pending";

      const query =
        tab === "resolved"
          ? { status: "resolved" }
          : { status: { $in: ["pending", "manual_intervention_required"] } };

      const pickups = await FailedPickup.find(query)
        .sort({ created_at: -1 }) // Newest first
        .lean();

      return NextResponse.json({ success: true, data: pickups });
    } catch (error: any) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 },
      );
    }
  },
);
