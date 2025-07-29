import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { NextResponse } from "next/server";
import {
  ServerError,
  ForbiddenError,
} from "../../../../custom/errors/dictionary/errorDictionary";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { AdminInviteToken } from "@omenai/shared-models/models/auth/verification/AdminInviteTokenSchema";

export const GET = async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  try {
    const token = params.get("id");
    if (!token) throw new ServerError("Missing token id");

    await connectMongoDB();

    const existingAdminInvite = await AdminInviteToken.findOne(
      { token },
      "token email"
    );

    if (!existingAdminInvite)
      return NextResponse.json({
        isActive: false,
      });

    return NextResponse.json({
      isActive: true,
    });
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);
    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status }
    );
  }
};
