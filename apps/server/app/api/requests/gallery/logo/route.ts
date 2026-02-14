import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { AccountGallery } from "@omenai/shared-models/models/auth/GallerySchema";
import { NextResponse } from "next/server";
import { handleErrorEdgeCases } from "../../../../../custom/errors/handler/errorHandler";
import { strictRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { CombinedConfig } from "@omenai/shared-types";
import { createErrorRollbarReport, validateRequestBody } from "../../../util";
import z from "zod";

const config: CombinedConfig = {
  ...strictRateLimit,
  allowedRoles: ["gallery"],
};
const LogoSchema = z.object({
  id: z.string(),
  url: z.string(),
});
export const POST = withRateLimitHighlightAndCsrf(config)(async function POST(
  request: Request,
) {
  try {
    const { id, url } = await validateRequestBody(request, LogoSchema);
    await connectMongoDB();
    const updateLogo = await AccountGallery.updateOne(
      { gallery_id: id },
      { $set: { logo: url } },
    );

    return NextResponse.json(
      {
        message: "Logo updated",
      },
      { status: 200 },
    );
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);
    createErrorRollbarReport("gallery: logo", error, error_response.status);
    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status },
    );
  }
});
