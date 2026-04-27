import { standardRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { CombinedConfig, SessionData } from "@omenai/shared-types";
import { NextResponse } from "next/server";
import { Curation } from "@omenai/shared-models/models/curation/CurationSchema";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { createErrorRollbarReport } from "../../util";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";

const config: CombinedConfig = {
  ...standardRateLimit,
  allowedRoles: ["admin"],
};

export const POST = withRateLimitHighlightAndCsrf(config)(async function POST(
  request: Request,
) {
  try {
    const body = await request.json();
    const { curation_type, draft_items } = body;

    if (!curation_type || !draft_items) {
      throw new Error("Curation type and draft items are required");
    }

    await connectMongoDB();
    // Upsert the document: update draft items or create if missing
    const updatedCuration = await Curation.findOneAndUpdate(
      { curation_type },
      { $set: { draft_items } },
      { new: true, upsert: true },
    );

    return NextResponse.json({
      message: "Draft saved successfully",
      data: updatedCuration,
    });
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);
    createErrorRollbarReport(
      "curation: save draft",
      error,
      error_response.status,
    );
    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status },
    );
  }
});
