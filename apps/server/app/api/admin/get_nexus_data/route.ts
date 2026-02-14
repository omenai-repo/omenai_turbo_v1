import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { NextResponse } from "next/server";
import { ServerError } from "../../../../custom/errors/dictionary/errorDictionary";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { strictRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { NexusTransactions } from "@omenai/shared-models/models/transactions/NexusModelSchema";
import { createErrorRollbarReport, validateGetRouteParams } from "../../util";
import z from "zod";

const GetNexusDataSchema = z.object({
  stateCode: z.string().min(1),
});
export const GET = withRateLimitHighlightAndCsrf(strictRateLimit)(
  async function GET(request: Request) {
    const url = new URL(request.url);
    const searchParams = url.searchParams;
    const stateCodeParams = searchParams.get("code");

    try {
      const { stateCode } = validateGetRouteParams(GetNexusDataSchema, {
        stateCode: stateCodeParams,
      });
      await connectMongoDB();
      const nexus = await NexusTransactions.findOne({ stateCode });

      if (!nexus)
        throw new ServerError("Something went wrong, contact tech team");

      return NextResponse.json(
        { message: "Data retrieved", data: nexus },
        { status: 200 },
      );
    } catch (error) {
      const error_response = handleErrorEdgeCases(error);
      createErrorRollbarReport(
        "admin: get nexus data",
        error,
        error_response?.status,
      );
      return NextResponse.json(
        { message: error_response?.message },
        { status: error_response?.status },
      );
    }
  },
);
