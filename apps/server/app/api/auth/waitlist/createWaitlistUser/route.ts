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
  ForbiddenError,
  ServerError,
} from "../../../../../custom/errors/dictionary/errorDictionary";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { SendWaitlistRegistrationEmail } from "@omenai/shared-emails/src/models/waitlist/SendWaitlistRegistrationEmail";
import { AccountArtist } from "@omenai/shared-models/models/auth/ArtistSchema";
import { AccountGallery } from "@omenai/shared-models/models/auth/GallerySchema";

/* ------------------ helpers ------------------ */

function validatePayload(payload: any) {
  const { name, email, entity } = payload;

  if (!name || !email || !entity) {
    throw new BadRequestError("Invalid parameters provided");
  }

  if (!["artist", "gallery"].includes(entity)) {
    throw new BadRequestError("Invalid entity type");
  }

  return { name, email, entity };
}

async function checkIfUserExists(email: string, entity: string) {
  const Model = entity === "artist" ? AccountArtist : AccountGallery;
  const exists = await Model.exists({ email });

  if (exists) {
    throw new ForbiddenError(
        "You're already part of the Omenai Experience, please login to continue your journey"
    );
  }
}

async function checkWaitlistConflict(name: string, email: string, entity: string) {
  const exists = await Waitlist.exists({ name, email, entity });

  if (exists) {
    throw new ConflictError("User previously added to wait list.");
  }
}

async function createWaitlistEntry(
    payload: Omit<WaitListTypes, "referrerKey" | "waitlistId" | "discount">
) {
  const created = await Waitlist.create(payload);

  if (!created) {
    throw new ServerError(
        "An error occured while adding you to our waitlist, please try again or contact support"
    );
  }

  return created;
}

/* ------------------ route ------------------ */

export const POST = withRateLimit(strictRateLimit)(async function POST(req: Request) {
  try {
    await connectMongoDB();

    const body = await req.json();
    const { name, email, entity } = validatePayload(body);

    await checkIfUserExists(email, entity);
    await checkWaitlistConflict(name, email, entity);

    await createWaitlistEntry({ name, email, entity });
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

    return NextResponse.json(
        { message: errorResponse.message },
        { status: errorResponse.status }
    );
  }
});
