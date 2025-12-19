import { withRateLimit } from "@omenai/shared-lib/auth/middleware/rate_limit_middleware";
import { strictRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { handleErrorEdgeCases } from "../../../../../custom/errors/handler/errorHandler";
import { createErrorRollbarReport } from "../../../util";
import { NextResponse } from "next/server";
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
  ServerError,
} from "../../../../../custom/errors/dictionary/errorDictionary";
import { Waitlist } from "@omenai/shared-models/models/auth/WaitlistSchema";
import { hashPayloadToken } from "@omenai/shared-lib/encryption/encrypt_token";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { WaitListTypes } from "@omenai/shared-types";
import { AccountArtist } from "@omenai/shared-models/models/auth/ArtistSchema";
import { AccountGallery } from "@omenai/shared-models/models/auth/GallerySchema";

/* ---------------- helpers ---------------- */

function validatePayload(body: any) {
  const { email, inviteCode, entity, referrerKey } = body ?? {};

  if (![email, inviteCode, entity, referrerKey].every(Boolean)) {
    throw new BadRequestError("Invalid parameters provided");
  }

  if (!["artist", "gallery"].includes(entity)) {
    throw new BadRequestError("Invalid entity type");
  }

  return { email, inviteCode, entity, referrerKey };
}

async function ensureUserNotRegistered(email: string, entity: string) {
  const Model = entity === "artist" ? AccountArtist : AccountGallery;
  const exists = await Model.exists({ email });

  if (exists) {
    throw new ForbiddenError(
        "You're already part of the Omenai Experience, please login to continue your journey"
    );
  }
}

async function fetchWaitlistUser(
    email: string,
    inviteCode: string,
    entity: string,
    referrerKey: string
) {
  const user = await Waitlist.findOne<
      Pick<WaitListTypes, "referrerKey">
  >({ email, inviteCode, entity, referrerKey })
      .lean()
      .select("referrerKey");

  if (!user) {
    throw new NotFoundError(
        "User does not exist, please sign up to our waitlist"
    );
  }

  return user;
}

function validateReferrerKey(
    waitlistReferrerKey: string,
    email: string,
    inviteCode: string,
    entity: string,
    providedReferrerKey: string
) {
  const token = hashPayloadToken({ email, inviteCode, entity });

  if (!token) {
    throw new ServerError("An error occurred while performing this action");
  }

  if (
      token !== waitlistReferrerKey &&
      providedReferrerKey !== waitlistReferrerKey
  ) {
    throw new ConflictError("Parameter server mismatch");
  }
}

/* ---------------- route ---------------- */

export const POST = withRateLimit(strictRateLimit)(async function POST(
    request: Request
) {
  try {
    await connectMongoDB();

    const body = await request.json();
    const { email, inviteCode, entity, referrerKey } = validatePayload(body);

    await ensureUserNotRegistered(email, entity);

    const waitlistUser = await fetchWaitlistUser(
        email,
        inviteCode,
        entity,
        referrerKey
    );

    validateReferrerKey(
        waitlistUser.referrerKey,
        email,
        inviteCode,
        entity,
        referrerKey
    );

    return NextResponse.json(
        { message: "Successfully validated waitlist user", status: 200 },
        { status: 200 }
    );
  } catch (error: any) {
    const errorResponse = handleErrorEdgeCases(error);

    createErrorRollbarReport(
        "auth: Waitlist creation",
        error,
        errorResponse.status
    );

    if (process.env.NODE_ENV === "development") {
      console.error(error);
    }

    return NextResponse.json(
        { message: errorResponse.message, status: errorResponse.status },
        { status: errorResponse.status }
    );
  }
});
