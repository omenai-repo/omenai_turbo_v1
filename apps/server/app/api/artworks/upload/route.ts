import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { Artworkuploads } from "@omenai/shared-models/models/artworks/UploadArtworkSchema";
import { Subscriptions } from "@omenai/shared-models/models/subscriptions/SubscriptionSchema";
import { NextResponse } from "next/server";
import {
  ForbiddenError,
  ServerError,
} from "../../../../custom/errors/dictionary/errorDictionary";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { strictRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { trimWhiteSpace } from "@omenai/shared-utils/src/trimWhitePace";
import { CombinedConfig, ExclusivityUpholdStatus } from "@omenai/shared-types";
import { toUTCDate } from "@omenai/shared-utils/src/toUtcDate";
import { addDaysToDate } from "@omenai/shared-utils/src/addDaysToDate";
import { redis } from "@omenai/upstash-config";

const config: CombinedConfig = {
  ...strictRateLimit,
  allowedRoles: ["artist", "gallery"],
};

export const POST = withRateLimitHighlightAndCsrf(config)(async function POST(
  request: Request
) {
  try {
    await connectMongoDB();
    const data = await request.json();

    // Validate required fields
    if (!data.author_id || !data.title || !data.role_access?.role) {
      throw new ServerError("Missing required fields");
    }

    const { role_access, title } = data;

    // Always trim title
    const new_title = trimWhiteSpace(title);

    const exclusivity_status: Pick<
      ExclusivityUpholdStatus,
      "exclusivity_type" | "exclusivity_end_date" | "order_auto_rejection_count"
    > = {
      exclusivity_type: role_access.role === "artist" ? "exclusive" : null,
      exclusivity_end_date:
        role_access.role === "artist" ? addDaysToDate(90) : null,
      order_auto_rejection_count: 0,
    };

    const payload = { ...data, title: new_title, exclusivity_status };

    // For galleries, check subscription before upload
    if (data.role_access.role === "gallery") {
      const active_subscription = await Subscriptions.findOne(
        { "customer.gallery_id": data.author_id },
        "plan_details status upload_tracker"
      );

      if (!active_subscription || active_subscription.status !== "active") {
        throw new ForbiddenError(
          "No active subscription for this user. Please activate a plan to continue"
        );
      }

      if (
        active_subscription.upload_tracker.upload_count >=
        active_subscription.upload_tracker.limit
      ) {
        throw new ForbiddenError(
          "Plan usage limit exceeded, please upgrade plan"
        );
      }
    }

    // Upload artwork
    const uploadArt = await Artworkuploads.create(payload);
    if (!uploadArt) {
      throw new ServerError("A server error has occurred, please try again");
    }

    // For galleries, increment upload count after successful upload
    if (data.role_access.role === "gallery") {
      const update_tracker = await Subscriptions.updateOne(
        { "customer.gallery_id": data.author_id },
        { $inc: { "upload_tracker.upload_count": 1 } }
      );

      if (update_tracker.modifiedCount === 0) {
        // Rollback the artwork upload if tracker update fails
        await Artworkuploads.deleteOne({ _id: uploadArt._id });
        throw new ServerError(
          "A server error has occurred, please try again or contact support"
        );
      }
    }

    const cacheKey = `artwork:${uploadArt.art_id}`;

    try {
      await redis.set(cacheKey, `${JSON.stringify(uploadArt)}`);
    } catch (redisWriteErr) {
      console.error(`Redis Write Error [${cacheKey}]:`, redisWriteErr);
    }

    return NextResponse.json(
      {
        message: "Artwork uploaded successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);
    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status }
    );
  }
});
