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
import { CombinedConfig } from "@omenai/shared-types";

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

    // Always trim title
    const new_title = trimWhiteSpace(data.title);
    const payload = { ...data, title: new_title };

    // For galleries, check subscription before upload
    if (data.role_access.role === "gallery") {
      const active_subscription = await Subscriptions.findOne(
        { "customer.gallery_id": data.author_id },
        "plan_details status upload_tracker"
      );

      if (!active_subscription || active_subscription.status !== "active") {
        throw new ForbiddenError("No active subscription for this user");
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

    // Get updated document count after upload
    const doc_count = await Artworkuploads.countDocuments({
      author_id: data.author_id,
    });

    return NextResponse.json(
      {
        message: "Artwork uploaded",
        data: doc_count,
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
