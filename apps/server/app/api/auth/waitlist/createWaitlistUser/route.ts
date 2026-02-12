import { withRateLimit } from "@omenai/shared-lib/auth/middleware/rate_limit_middleware";
import { strictRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { handleErrorEdgeCases } from "../../../../../custom/errors/handler/errorHandler";
import { createErrorRollbarReport, validateRequestBody } from "../../../util";
import { NextResponse } from "next/server";
import { WaitListTypes } from "@omenai/shared-types";
import { Waitlist } from "@omenai/shared-models/models/auth/WaitlistSchema";
import {
  ForbiddenError,
  ServerError,
} from "../../../../../custom/errors/dictionary/errorDictionary";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { SendWaitlistRegistrationEmail } from "@omenai/shared-emails/src/models/waitlist/SendWaitlistRegistrationEmail";
import { AccountArtist } from "@omenai/shared-models/models/auth/ArtistSchema";
import { AccountGallery } from "@omenai/shared-models/models/auth/GallerySchema";
import { rollbarServerInstance } from "@omenai/rollbar-config";
import z from "zod";

/* ------------------ helpers ------------------ */

async function checkIfUserExists(email: string, entity: string) {
  const Model = entity === "artist" ? AccountArtist : AccountGallery;
  const exists = await Model.exists({ email });

  if (exists) {
    throw new ForbiddenError(
      "You're already part of the Omenai Experience, please login to continue your journey",
    );
  }
}

async function checkWaitlistConflict(
  name: string,
  email: string,
  entity: string,
) {
  const waitlistExists = await Waitlist.findOne({ email, entity }, "isInvited");

  if (waitlistExists) {
    throw new ForbiddenError(
      waitlistExists.isInvited
        ? "An invitation to join our platform had already been sent. Please check your email for your access code."
        : "You’re already signed up for our waitlist. Thanks for your patience — we’ll be in touch soon.",
    );
  }
}

async function createWaitlistEntry(
  payload: Omit<
    WaitListTypes,
    "referrerKey" | "waitlistId" | "discount" | "inviteAccepted" | "entityId"
  >,
) {
  try {
    const created = await Waitlist.create(payload);

    if (!created) {
      throw new ServerError(
        "An error occured while adding you to our waitlist, please try again or contact support",
      );
    }

    return;
  } catch (error) {
    rollbarServerInstance.error({ context: "Waitlist creation", error });
    throw new ServerError(
      "An error occured while adding you to our waitlist, please try again or contact support",
    );
  }
}

/* ------------------ route ------------------ */
const CreateWaitlistUserSchema = z.object({
  name: z.string(),
  email: z.email(),
  entity: z.enum(["artist", "gallery", "user"]),
});
export const POST = withRateLimit(strictRateLimit)(async function POST(
  req: Request,
) {
  try {
    await connectMongoDB();
    const { email, entity, name } = await validateRequestBody(
      req,
      CreateWaitlistUserSchema,
    );
    await checkIfUserExists(email, entity);
    await checkWaitlistConflict(name, email, entity);
    await createWaitlistEntry({ name, email, entity });
    await SendWaitlistRegistrationEmail({ email });
    return NextResponse.json(
      { message: "Successfully added to waitlist" },
      { status: 201 },
    );
  } catch (error: any) {
    const errorResponse = handleErrorEdgeCases(error);
    createErrorRollbarReport(
      "auth: Waitlist creation",
      error,
      errorResponse.status,
    );
    return NextResponse.json(
      { message: errorResponse.message },
      { status: errorResponse.status },
    );
  }
});
