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

    const doc_count = await Artworkuploads.countDocuments({
      author_id: data.author_id,
    });

    if (data.role_access.role === "gallery") {
      const active_subscription = await Subscriptions.findOne(
        { "customer.gallery_id": data.author_id },
        "plan_details status upload_tracker"
      );

      if (!active_subscription || active_subscription.status !== "active")
        throw new ForbiddenError("No active subscription for this user");

      if (
        active_subscription.upload_tracker.upload_count >=
        active_subscription.upload_tracker.limit
      )
        throw new ForbiddenError(
          "Plan usage limit exceeded, please upgrade plan"
        );
    }

    const new_title = trimWhiteSpace(data.title);
    const payload = { ...data, title: new_title };

    const uploadArt = await Artworkuploads.create({ ...payload });

    if (!uploadArt)
      throw new ServerError("A server error has occured, please try again");

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
