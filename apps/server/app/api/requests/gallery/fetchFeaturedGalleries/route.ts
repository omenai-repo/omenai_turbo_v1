import { lenientRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitAndHighlight } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { NextResponse } from "next/server";
import { handleErrorEdgeCases } from "../../../../../custom/errors/handler/errorHandler";
import { AccountGallery } from "@omenai/shared-models/models/auth/GallerySchema";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
export const GET = withRateLimitAndHighlight(lenientRateLimit)(
  async function GET() {
    try {
      await connectMongoDB();
      const galleries = await AccountGallery.find(
        {},
        "logo name gallery_id"
      ).limit(10);

      return NextResponse.json({
        message: "Featured galleries fetched",
        data: galleries,
      });
    } catch (error) {
      const error_response = handleErrorEdgeCases(error);

      return NextResponse.json(
        { message: error_response?.message },
        { status: error_response?.status }
      );
    }
  }
);
