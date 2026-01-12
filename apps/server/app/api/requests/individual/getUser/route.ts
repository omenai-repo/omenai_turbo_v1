import { NextRequest, NextResponse } from "next/server";
import { handleErrorEdgeCases } from "../../../../../custom/errors/handler/errorHandler";
import {
  BadRequestError,
  NotFoundError,
} from "../../../../../custom/errors/dictionary/errorDictionary";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { IndividualSchemaTypes } from "@omenai/shared-types";
import { createErrorRollbarReport } from "../../../util";
import { AccountIndividual } from "@omenai/shared-models/models/auth/IndividualSchema";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const user_id = searchParams.get("id");

  try {
    if (!user_id || typeof user_id !== "string")
      throw new BadRequestError("Invalid ID parameter provided");
    await connectMongoDB();

    const user = await AccountIndividual.findOne<IndividualSchemaTypes>({
      user_id,
    }).exec();

    if (!user) throw new NotFoundError("user data not found");

    const { name, address, email, preferences, verified, phone } = user;

    const payload = {
      name,
      email,
      address,
      preferences,
      verified,
      phone,
    };
    return NextResponse.json(
      {
        message: "Profile retrieved successfully",
        user: payload,
      },
      { status: 200 }
    );
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);
    createErrorRollbarReport(
      "user: fetch profile",
      error,
      error_response.status
    );
    console.log(error);
    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status }
    );
  }
}
