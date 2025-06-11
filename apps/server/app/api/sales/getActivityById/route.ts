import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { SalesActivity } from "@omenai/shared-models/models/sales/SalesActivity";
import { NextResponse } from "next/server";
import { ServerError } from "../../../../custom/errors/dictionary/errorDictionary";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { withAppRouterHighlight } from "@omenai/shared-lib/highlight/app_router_highlight";

export const POST = withAppRouterHighlight(async function POST(
  request: Request
) {
  try {
    await connectMongoDB();

    const { id, year } = await request.json();

    const activities = await SalesActivity.find({
      id,
      year,
    });

    if (!activities) throw new ServerError("No orders were found");

    return NextResponse.json(
      {
        message: "Successful",
        data: activities,
      },
      { status: 200 }
    );
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);

    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status }
    );
  }
});
