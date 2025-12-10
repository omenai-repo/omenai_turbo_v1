import { withRateLimit } from "@omenai/shared-lib/auth/middleware/rate_limit_middleware";
import { strictRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { handleErrorEdgeCases } from "../../../../../custom/errors/handler/errorHandler";
import { createErrorRollbarReport } from "../../../util";
import { NextResponse } from "next/server";
import { hashPayloadToken } from "@omenai/shared-lib/encryption/encrypt_token";
import { Waitlist } from "@omenai/shared-models/models/auth/WaitlistSchema";
import {
  BadRequestError,
  NotFoundError,
  ServerError,
} from "../../../../../custom/errors/dictionary/errorDictionary";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";

export const POST = withRateLimit(strictRateLimit)(async function POST(
  request: Request
) {
  try {
    await connectMongoDB();
    const { email, inviteCode, entity } = await request.json();

    if (!email || !inviteCode || !entity)
      throw new BadRequestError("Invalid parameters provided");

    const waitlistUserExists = await Waitlist.exists({
      email,
      inviteCode,
      entity,
    });

    if (!waitlistUserExists)
      throw new NotFoundError(
        "User does not exist, please sign up to our waitlist"
      );

    const payload = { email, inviteCode, entity };

    const token = hashPayloadToken(payload);

    if (!token)
      throw new ServerError(
        "An error occured while performing this action, please try again or contact support"
      );

    const updateWaitlist = await Waitlist.updateOne(
      { email, inviteCode, entity },
      { $set: { referrerKey: token } }
    );

    if (updateWaitlist.modifiedCount === 0)
      throw new ServerError(
        "An error occured while performing this action, please try again or contact support"
      );

    return NextResponse.json(
      { message: "Invite referrer key created", referrerKey: token },
      { status: 201 }
    );
  } catch (error: any) {
    const errorResponse = handleErrorEdgeCases(error);
    createErrorRollbarReport(
      "auth: Waitlist referrerKey error",
      error,
      errorResponse.status
    );
    console.log(error);
    return NextResponse.json(
      { message: errorResponse?.message },
      { status: errorResponse?.status }
    );
  }
});
