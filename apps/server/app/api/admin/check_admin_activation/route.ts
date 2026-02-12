import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { NextResponse } from "next/server";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { AdminInviteToken } from "@omenai/shared-models/models/auth/verification/AdminInviteTokenSchema";
import { createErrorRollbarReport, validateGetRouteParams } from "../../util";
import z from "zod";

const CheckAdminActivation = z.object({
  id: z.string().min(1),
});
export const GET = async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  try {
    const id = params.get("id");
    const { id: token } = validateGetRouteParams(CheckAdminActivation, { id });

    await connectMongoDB();

    const existingAdminInvite = await AdminInviteToken.findOne(
      { token },
      "token email",
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
    createErrorRollbarReport(
      "admin: check admin activation",
      error,
      error_response?.status,
    );
    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status },
    );
  }
};
