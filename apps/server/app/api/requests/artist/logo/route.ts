import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { NextResponse } from "next/server";
import { handleErrorEdgeCases } from "../../../../../custom/errors/handler/errorHandler";
import { AccountArtist } from "@omenai/shared-models/models/auth/ArtistSchema";
import { ServerError } from "../../../../../custom/errors/dictionary/errorDictionary";
import { strictRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { CombinedConfig } from "@omenai/shared-types";
import { createErrorRollbarReport, validateRequestBody } from "../../../util";
import z from "zod";

const config: CombinedConfig = {
  ...strictRateLimit,
  allowedRoles: ["artist"],
};
const LogoSchema = z.object({
  id: z.string(),
  url: z.string(),
});
export const POST = withRateLimitHighlightAndCsrf(config)(async function POST(
  request: Request,
) {
  try {
    await connectMongoDB();

    const { id, url } = await validateRequestBody(request, LogoSchema);

    const updateLogo = await AccountArtist.updateOne(
      { artist_id: id },
      { $set: { logo: url } },
    );

    if (updateLogo.modifiedCount === 0)
      throw new ServerError(
        "Error updating logo. Please try again or contact support",
      );

    return NextResponse.json(
      {
        message: "Logo updated",
      },
      { status: 200 },
    );
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);
    createErrorRollbarReport("artist: logo", error, error_response.status);
    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status },
    );
  }
});
