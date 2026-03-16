import { NextResponse } from "next/server";
import { standardRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { CombinedConfig } from "@omenai/shared-types";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { createErrorRollbarReport } from "../../util";
import { uploadArtworkLogic } from "../../uploadArtwork.service";

const config: CombinedConfig = {
  ...standardRateLimit,
  allowedRoles: ["artist", "gallery"],
};

export const POST = withRateLimitHighlightAndCsrf(config)(async function POST(
  request: Request,
) {
  try {
    const body = await request.json();

    const result = await uploadArtworkLogic(body);

    return NextResponse.json({ message: result.message }, { status: 200 });
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);
    createErrorRollbarReport("artwork: upload", error, error_response.status);

    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status },
    );
  }
});
