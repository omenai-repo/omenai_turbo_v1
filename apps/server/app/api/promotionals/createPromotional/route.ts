import { PromotionalModel } from "@omenai/shared-models/models/promotionals/PromotionalSchema";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { CombinedConfig, PromotionalSchemaTypes } from "@omenai/shared-types";
import { NextResponse } from "next/server";
import { ServerError } from "../../../../custom/errors/dictionary/errorDictionary";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";

import { strictRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { createErrorRollbarReport } from "../../util";
const config: CombinedConfig = {
  ...strictRateLimit,
  allowedRoles: ["admin"],
};
export const POST = withRateLimitHighlightAndCsrf(config)(async function POST(
  request: Request,
) {
  try {
    await connectMongoDB();
    const data: PromotionalSchemaTypes = await request.json();

    const createPromotionalData = await PromotionalModel.create(data);

    if (!createPromotionalData)
      throw new ServerError(
        "Something went wrong, please try again or contact support",
      );

    return NextResponse.json({ message: "Promotional data uploaded" });
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);
    createErrorRollbarReport(
      "promotional: create promotional",
      error,
      error_response.status,
    );
    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status },
    );
  }
});
