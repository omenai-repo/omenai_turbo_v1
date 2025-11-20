import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { NextResponse } from "next/server";
import { ServerError } from "../../../../custom/errors/dictionary/errorDictionary";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { strictRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { NexusTransactions } from "@omenai/shared-models/models/transactions/NexusModelSchema";
import { createErrorRollbarReport } from "../../util";

export const GET = withRateLimitHighlightAndCsrf(strictRateLimit)(
  async function GET(request: Request) {
    const url = new URL(request.url);
    const searchParams = url.searchParams;
    const stateCode = searchParams.get("code");

    try {
      if (!stateCode) {
        return NextResponse.json(
          { message: "State code is required" },
          { status: 400 }
        );
      }
      await connectMongoDB();
      const nexus = await NexusTransactions.findOne({ stateCode });

      if (!nexus)
        throw new ServerError("Something went wrong, contact tech team");

      return NextResponse.json(
        { message: "Data retrieved", data: nexus },
        { status: 200 }
      );
    } catch (error) {
      const error_response = handleErrorEdgeCases(error);
      createErrorRollbarReport(
        "admin: get nexus data",
        error as any,
        error_response?.status
      );
      return NextResponse.json(
        { message: error_response?.message },
        { status: error_response?.status }
      );
    }
  }
);
