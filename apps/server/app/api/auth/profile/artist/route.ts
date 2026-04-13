import { strictRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { CombinedConfig } from "@omenai/shared-types";
import { NextResponse } from "next/server";
import { handleErrorEdgeCases } from "../../../../../custom/errors/handler/errorHandler";
import { createErrorRollbarReport } from "../../../util";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { AccountArtist } from "@omenai/shared-models/models/auth/ArtistSchema";
import { NotFoundError } from "../../../../../custom/errors/dictionary/errorDictionary";
const config: CombinedConfig = {
  ...strictRateLimit,
  allowedRoles: ["artist"],
};
export const GET = withRateLimitHighlightAndCsrf(config)(async function GET(
  request: Request,
) {
  const id = new URL(request.url).searchParams.get("id");

  try {
    if (!id || typeof id !== "string") {
      throw new Error("Invalid or missing artist ID");
    }

    await connectMongoDB();
    const artist = await AccountArtist.findOne(
      { artist_id: id },
      "name, email, address base_currency",
    );

    if (!artist) throw new NotFoundError("Artist not found");
    return NextResponse.json({ artist }, { status: 200 });
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);
    createErrorRollbarReport(
      "auth: Artist profile retrieval",
      error,
      error_response.status,
    );
    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status },
    );
  }
});
