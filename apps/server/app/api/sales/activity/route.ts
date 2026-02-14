import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { SalesActivity } from "@omenai/shared-models/models/sales/SalesActivity";
import { NextResponse } from "next/server";
import { ServerError } from "../../../../custom/errors/dictionary/errorDictionary";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";

import { createErrorRollbarReport } from "../../util";
import { standardRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimit } from "@omenai/shared-lib/auth/middleware/rate_limit_middleware";

export const POST = withRateLimit(standardRateLimit)(async function POST(
  request: Request,
) {
  try {
    await connectMongoDB();

    const data = await request.json();

    const addSalesData = await SalesActivity.create({ ...data });

    if (!addSalesData) throw new ServerError("An error was encountered.");

    return NextResponse.json(
      {
        message: "Sales data added",
      },
      { status: 200 },
    );
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);
    createErrorRollbarReport("sales: activity", error, error_response.status);

    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status },
    );
  }
});
