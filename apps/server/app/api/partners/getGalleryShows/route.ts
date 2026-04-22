import { standardRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimit } from "@omenai/shared-lib/auth/middleware/rate_limit_middleware";
import { BadRequestError } from "../../../../custom/errors/dictionary/errorDictionary";
import { NextResponse } from "next/server";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { createErrorRollbarReport } from "../../util";
import { getGalleryOverviewService } from "../../services/gallery/partners/getGalleryOverview.service";
import { getGalleryShowsService } from "../../services/gallery/partners/getGalleryShows.service";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";

export const GET = withRateLimit(standardRateLimit)(async function GET(
  request: Request,
) {
  const { searchParams } = new URL(request.url);
  const gallery_id = searchParams.get("id");
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "12", 10);
  try {
    if (!gallery_id) throw new BadRequestError("Missing gallery_id parameter");
    await connectMongoDB();
    const result = await getGalleryShowsService(gallery_id, page, limit);
    if (!result.isOk) {
      return new Response(JSON.stringify({ message: result.message }), {
        status: 400,
      });
    }
    return NextResponse.json(
      { data: result.data, pagination: result.pagination },
      { status: 200 },
    );
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);
    createErrorRollbarReport(
      "Partners: Get Gallery shows data",
      error,
      error_response.status,
    );
    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status },
    );
  }
});
