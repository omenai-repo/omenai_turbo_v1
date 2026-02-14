import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { NextResponse } from "next/server";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { getCachedArtwork } from "../utils";
import { createErrorRollbarReport, validateRequestBody } from "../../util";
import { standardRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimit } from "@omenai/shared-lib/auth/middleware/rate_limit_middleware";
import z from "zod";
const Schema = z.object({
  art_id: z.string().min(1),
});
export const POST = withRateLimit(standardRateLimit)(async function POST(
  request: Request,
) {
  try {
    await connectMongoDB();

    const { art_id } = await validateRequestBody(request, Schema);

    const artwork = await getCachedArtwork(art_id);

    return NextResponse.json(
      {
        message: "Successful",
        data: artwork,
      },
      { status: 200 },
    );
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);
    createErrorRollbarReport(
      "artwork: get single Artwork on purchase",
      error,
      error_response.status,
    );
    return NextResponse.json(
      { message: error_response!.message },
      { status: error_response!.status },
    );
  }
});
