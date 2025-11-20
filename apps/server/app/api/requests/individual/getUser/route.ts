import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { AccountIndividual } from "@omenai/shared-models/models/auth/IndividualSchema";
import { NextResponse } from "next/server";
import { NotFoundError } from "../../../../../custom/errors/dictionary/errorDictionary";
import { handleErrorEdgeCases } from "../../../../../custom/errors/handler/errorHandler";
import { withAppRouterHighlight } from "@omenai/shared-lib/highlight/app_router_highlight";
import { createErrorRollbarReport } from "../../../util";

export const POST = withAppRouterHighlight(async function POST(
  request: Request
) {
  try {
    await connectMongoDB();

    const { accountId } = await request.json();

    const user = await AccountIndividual.findOne(
      { user_id: accountId },
      "address"
    );

    if (!user) throw new NotFoundError("User account does not exist");

    return NextResponse.json(
      {
        message: "Successful",
        data: user,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    const error_response = handleErrorEdgeCases(error);
    createErrorRollbarReport(
      "individual: get user",
      error as any,
      error_response.status
    );

    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status }
    );
  }
});
