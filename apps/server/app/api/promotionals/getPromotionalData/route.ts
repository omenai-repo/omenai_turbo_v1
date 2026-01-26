import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { PromotionalModel } from "@omenai/shared-models/models/promotionals/PromotionalSchema";
import { NextResponse } from "next/server";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";

import { createErrorRollbarReport } from "../../util";
import { standardRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimit } from "@omenai/shared-lib/auth/middleware/rate_limit_middleware";
export const revalidate = 0;
export const dynamic = "force-dynamic";

export const GET = withRateLimit(standardRateLimit)(async function GET() {
  try {
    await connectMongoDB();

    const get_promotionals = await PromotionalModel.find().sort({
      createdAt: -1,
    }); // Sort by createdAt in descending order (newest first)

    if (!get_promotionals) throw new Error("Something went wrong");

    return NextResponse.json({
      message: "Promotional data retreived",
      data: get_promotionals,
    });
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);
    createErrorRollbarReport(
      "promotional: get promotional data",
      error,
      error_response.status,
    );
    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status },
    );
  }
});
