import {
  lenientRateLimit,
  standardRateLimit,
} from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimit } from "@omenai/shared-lib/auth/middleware/rate_limit_middleware";
import { NextResponse } from "next/server";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { createErrorRollbarReport } from "../../util";
import z from "zod";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { getIndividualShowService } from "../../services/events/getIndividualShowDetails.service";
import { BadRequestError } from "../../../../custom/errors/dictionary/errorDictionary";

const individualShowServiceSchema = z.object({
  eventId: z.string(),
});
export const GET = withRateLimit(lenientRateLimit)(async function GET(
  request: Request,
) {
  const { searchParams } = new URL(request.url);
  const eventId = searchParams.get("eventId");
  try {
    await connectMongoDB();

    const validation = individualShowServiceSchema.safeParse({ eventId });
    if (!validation.success) {
      throw new BadRequestError("Invalid or missing eventId parameter");
    }

    console.log(eventId);

    const showDetails = await getIndividualShowService(eventId as string);
    console.log(showDetails);
    if (!showDetails) {
      return NextResponse.json(
        { isOk: false, message: "Show not found" },
        { status: 404 },
      );
    }
    return NextResponse.json(
      { isOk: true, data: showDetails.data },
      { status: 200 },
    );
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);
    createErrorRollbarReport("exchange rate", error, error_response.status);
    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status },
    );
  }
});
