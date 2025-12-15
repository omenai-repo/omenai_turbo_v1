import { withRateLimit } from "@omenai/shared-lib/auth/middleware/rate_limit_middleware";
import { strictRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { handleErrorEdgeCases } from "../../../../../custom/errors/handler/errorHandler";
import { createErrorRollbarReport } from "../../../util";
import { NextResponse } from "next/server";
import { WaitListTypes } from "@omenai/shared-types";
import { Waitlist } from "@omenai/shared-models/models/auth/WaitlistSchema";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  ServerError,
} from "../../../../../custom/errors/dictionary/errorDictionary";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { SendWaitlistRegistrationEmail } from "@omenai/shared-emails/src/models/waitlist/SendWaitlistRegistrationEmail";

export const POST = withRateLimit(strictRateLimit)(async function POST(
  req: Request
) {
  try {
    await connectMongoDB();
    const { name, email, entity } = await req.json();
    if (!email || !name || !entity)
      throw new BadRequestError("Invalid parameters provided");

    const waitlistUserExists = await Waitlist.exists({ email, entity, name });

    if (waitlistUserExists)
      throw new ConflictError("User previously added to wait list.");

    const payload: Omit<WaitListTypes, "referrerKey" | "waitlistId" | 'discount'> = {
      name,
      email,
      entity,
    };
    const createWaitlistUser = await Waitlist.create(payload);

    if (!createWaitlistUser)
      throw new ServerError(
        "An error occured while adding you to our waitlist, please try again or contact support"
      );

    // TODO: Send a mail to this user informing them they've been added to the waitlist
    await SendWaitlistRegistrationEmail({ email });
    return NextResponse.json(
      { message: "Successfully added to waitlist" },
      { status: 201 }
    );
  } catch (error: any) {
    const errorResponse = handleErrorEdgeCases(error);
    createErrorRollbarReport(
      "auth: Waitlist creation",
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
