import { standardRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimit } from "@omenai/shared-lib/auth/middleware/rate_limit_middleware";
import { BadRequestError } from "../../../../custom/errors/dictionary/errorDictionary";
import { getGalleryProfile } from "../../services/gallery/partners/getGalleryProfile.service";
import { NextResponse } from "next/server";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { createErrorRollbarReport } from "../../util";

export const GET = withRateLimit(standardRateLimit)(async function GET(
  request: Request,
) {
  const { searchParams } = new URL(request.url);
  const gallery_id = searchParams.get("id");
  try {
    if (!gallery_id) throw new BadRequestError("Missing gallery_id parameter");
    const result = await getGalleryProfile(gallery_id);
    if (!result.isOk) {
      return new Response(JSON.stringify({ message: result.message }), {
        status: 400,
      });
    }
    return NextResponse.json({ data: result.data }, { status: 200 });
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);
    createErrorRollbarReport(
      "Partners: get gallery profile",
      error,
      error_response.status,
    );
    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status },
    );
  }
});
