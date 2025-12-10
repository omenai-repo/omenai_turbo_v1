import { withRateLimit } from "@omenai/shared-lib/auth/middleware/rate_limit_middleware";
import { strictRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { handleErrorEdgeCases } from "../../../../../custom/errors/handler/errorHandler";
import { createErrorRollbarReport } from "../../../util";
import { NextResponse } from "next/server";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  ServerError,
} from "../../../../../custom/errors/dictionary/errorDictionary";
import { Waitlist } from "@omenai/shared-models/models/auth/WaitlistSchema";
import { hashPayloadToken } from "@omenai/shared-lib/encryption/encrypt_token";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { WaitListTypes } from "@omenai/shared-types";

export const POST = withRateLimit(strictRateLimit)(async function POST(
  request: Request
) {
  try {
    const body = await request.json();
    const { email, inviteCode, entity, referrerKey } = body ?? {};

    if (![email, inviteCode, entity, referrerKey].every(Boolean))
      throw new BadRequestError("Invalid parameters provided");

    await connectMongoDB();

    const waitlistUser = await Waitlist.findOne<
      Pick<WaitListTypes, "referrerKey">
    >({
      email,
      inviteCode,
      entity,
      referrerKey,
    })
      .lean()
      .select("referrerKey");

    if (!waitlistUser)
      throw new NotFoundError(
        "User does not exist, please sign up to our waitlist"
      );

    const token = hashPayloadToken({ email, inviteCode, entity });
    if (!token)
      throw new ServerError("An error occurred while performing this action");

    if (
      token !== waitlistUser.referrerKey &&
      referrerKey !== waitlistUser.referrerKey
    )
      throw new ConflictError("Parameter server mismatch");

    return NextResponse.json(
      { message: "Successfully validated waitlist user" },
      { status: 200 }
    );
  } catch (error: any) {
    const errorResponse = handleErrorEdgeCases(error);
    createErrorRollbarReport(
      "auth: Waitlist creation",
      error,
      errorResponse.status
    );

    if (process.env.NODE_ENV === "development") console.error(error);

    return NextResponse.json(
      { message: errorResponse?.message },
      { status: errorResponse?.status }
    );
  }
});
