import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { Artworkuploads } from "@omenai/shared-models/models/artworks/UploadArtworkSchema";
import { Subscriptions } from "@omenai/shared-models/models/subscriptions/SubscriptionSchema";
import { NextResponse } from "next/server";
import {
  ForbiddenError,
  ServerError,
} from "../../../../custom/errors/dictionary/errorDictionary";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { withAppRouterHighlight } from "@omenai/shared-lib/highlight/app_router_highlight";
import { strictRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitAndHighlight } from "@omenai/shared-lib/auth/middleware/combined_middleware";

export const POST = withRateLimitAndHighlight(strictRateLimit)(
  async function POST(request: Request) {
    try {
      await connectMongoDB();

      const data = await request.json();

      const doc_count = await Artworkuploads.countDocuments({
        author_id: data.author_id,
      });

      if (data.role_access.role === "gallery") {
        const active_subscription = await Subscriptions.findOne(
          { "customer.gallery_id": data.author_id },
          "plan_details status"
        );

        if (!active_subscription || active_subscription.status !== "active")
          throw new ForbiddenError("No active subscription for this user");

        if (
          active_subscription.plan_details.type === "Basic" &&
          doc_count >= 25
        )
          throw new ForbiddenError(
            "Plan usage limit exceeded, please upgrade plan"
          );
      }

      const uploadArt = await Artworkuploads.create({ ...data });

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
  }
);
