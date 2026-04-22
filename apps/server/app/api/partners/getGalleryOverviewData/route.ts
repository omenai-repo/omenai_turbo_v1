import { standardRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimit } from "@omenai/shared-lib/auth/middleware/rate_limit_middleware";
import { BadRequestError } from "../../../../custom/errors/dictionary/errorDictionary";
import { NextResponse } from "next/server";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { createErrorRollbarReport } from "../../util";
import { getGalleryOverviewService } from "../../services/gallery/partners/getGalleryOverview.service";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";

export const GET = withRateLimit(standardRateLimit)(async function GET(
  request: Request,
) {
  const { searchParams } = new URL(request.url);
  const gallery_id = searchParams.get("id");
  try {
    if (!gallery_id) throw new BadRequestError("Missing gallery_id parameter");
    await connectMongoDB();
    const result = await getGalleryOverviewService(gallery_id);
    if (!result.isOk) {
      return new Response(JSON.stringify({ message: result.message }), {
        status: 400,
      });
    }
    return NextResponse.json({ data: result.data }, { status: 200 });
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);
    createErrorRollbarReport(
      "Partners: Get Gallery overview data",
      error,
      error_response.status,
    );
    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status },
    );
  }
});
