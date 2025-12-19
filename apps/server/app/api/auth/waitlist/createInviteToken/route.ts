import { withRateLimit } from "@omenai/shared-lib/auth/middleware/rate_limit_middleware";
import { strictRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { handleErrorEdgeCases } from "../../../../../custom/errors/handler/errorHandler";
import { createErrorRollbarReport } from "../../../util";
import { NextResponse } from "next/server";
import { hashPayloadToken } from "@omenai/shared-lib/encryption/encrypt_token";
import { Waitlist } from "@omenai/shared-models/models/auth/WaitlistSchema";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
  ServerError,
} from "../../../../../custom/errors/dictionary/errorDictionary";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { AccountArtist } from "@omenai/shared-models/models/auth/ArtistSchema";
import { AccountGallery } from "@omenai/shared-models/models/auth/GallerySchema";

/* ---------------- helpers ---------------- */

function validatePayload(body: any) {
  const { email, inviteCode, entity } = body ?? {};

  if (!email || !inviteCode || !entity) {
    throw new BadRequestError("Invalid parameters provided");
  }

  if (!["artist", "gallery"].includes(entity)) {
    throw new BadRequestError("Invalid entity type");
  }

  return { email, inviteCode, entity };
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

async function ensureWaitlistUserExists(
    email: string,
    inviteCode: string,
    entity: string
) {
  const exists = await Waitlist.exists({ email, inviteCode, entity });

  if (!exists) {
    throw new NotFoundError(
        "User does not exist, please sign up to our waitlist"
    );
  }
}

function generateReferrerKey(payload: {
  email: string;
  inviteCode: string;
  entity: string;
}) {
  const token = hashPayloadToken(payload);

  if (!token) {
    throw new ServerError(
        "An error occured while performing this action, please try again or contact support"
    );
  }

  return token;
}

async function saveReferrerKey(
    email: string,
    inviteCode: string,
    entity: string,
    token: string
) {
  const result = await Waitlist.updateOne(
      { email, inviteCode, entity },
      { $set: { referrerKey: token } }
  );

  if (result.modifiedCount === 0) {
    throw new ServerError(
        "An error occured while performing this action, please try again or contact support"
    );
  }
}

/* ---------------- route ---------------- */

export const POST = withRateLimit(strictRateLimit)(async function POST(
    request: Request
) {
  try {
    await connectMongoDB();

    const body = await request.json();
    const { email, inviteCode, entity } = validatePayload(body);

    await ensureUserNotRegistered(email, entity);
    await ensureWaitlistUserExists(email, inviteCode, entity);

    const referrerKey = generateReferrerKey({ email, inviteCode, entity });
    await saveReferrerKey(email, inviteCode, entity, referrerKey);

    return NextResponse.json(
        { message: "Invite referrer key created", referrerKey },
        { status: 201 }
    );
  } catch (error: any) {
    const errorResponse = handleErrorEdgeCases(error);

    createErrorRollbarReport(
        "auth: Waitlist referrerKey error",
        error,
        errorResponse.status
    );

    return NextResponse.json(
        { message: errorResponse.message },
        { status: errorResponse.status }
    );
  }
});
