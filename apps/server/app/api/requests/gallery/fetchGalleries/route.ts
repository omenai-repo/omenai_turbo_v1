import { lenientRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { NextResponse } from "next/server";
import { handleErrorEdgeCases } from "../../../../../custom/errors/handler/errorHandler";
import { AccountGallery } from "@omenai/shared-models/models/auth/GallerySchema";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { createErrorRollbarReport } from "../../../util";
import { withRateLimit } from "@omenai/shared-lib/auth/middleware/rate_limit_middleware";

export const GET = withRateLimit(lenientRateLimit)(async function GET(
  request: Request,
) {
  const searchParam = new URL(request.url).searchParams;

  // Convert to integers for DB math
  const page = parseInt(searchParam.get("page") || "1", 10);
  const limit = parseInt(searchParam.get("limit") || "15", 10);

  // Calculate how many documents to skip based on the current page
  const skip = (page - 1) * limit;

  try {
    await connectMongoDB();

    // Run count and fetch concurrently for better performance
    const [totalGalleries, galleries] = await Promise.all([
      AccountGallery.countDocuments({
        verified: true,
        gallery_verified: true,
        "subscription_status.active": true,
      }),
      AccountGallery.find(
        {
          verified: true,
          gallery_verified: true,
          "subscription_status.active": true,
        },
        "logo name gallery_id address",
      )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
    ]);

    const totalPages = Math.ceil(totalGalleries / limit);

    return NextResponse.json({
      message: "Featured galleries fetched",
      data: galleries,
      pagination: {
        page,
        limit,
        total: totalGalleries,
        totalPages,
      },
    });
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);
    createErrorRollbarReport(
      "gallery: fetch featured galleries",
      error,
      error_response.status,
    );
    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status },
    );
  }
});
