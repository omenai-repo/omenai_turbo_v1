import { parseRegisterData } from "@omenai/shared-lib/auth/parseRegisterData";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { VerificationCodes } from "@omenai/shared-models/models/auth/verification/codeTimeoutSchema";
import { generateDigit } from "@omenai/shared-utils/src/generateToken";
import { NextResponse, NextResponse as res } from "next/server";
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  ServerError,
  ServiceUnavailableError,
} from "../../../../../custom/errors/dictionary/errorDictionary";
import { handleErrorEdgeCases } from "../../../../../custom/errors/handler/errorHandler";
import { sendArtistSignupMail } from "@omenai/shared-emails/src/models/artist/sendArtistSignupMail";
import { AccountArtist } from "@omenai/shared-models/models/auth/ArtistSchema";

import { DeviceManagement } from "@omenai/shared-models/models/device_management/DeviceManagementSchema";
import { fetchConfigCatValue } from "@omenai/shared-lib/configcat/configCatFetch";
import { createErrorRollbarReport, validateRequestBody } from "../../../util";
import { Waitlist } from "@omenai/shared-models/models/auth/WaitlistSchema";
import { standardRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimit } from "@omenai/shared-lib/auth/middleware/rate_limit_middleware";
import z from "zod";

const RegisterSchema = z
  .object({
    name: z.string(),
    email: z.email(),
    password: z.string(),
    confirmPassword: z.string(),
    referrerKey: z.string().optional(),
    inviteCode: z.string().optional(),
    device_push_token: z.string().optional(),
    phone: z.string(),
    art_style: z.string().or(z.array(z.string())),
    address: z.object({
      address_line: z.string(),
      city: z.string(),
      country: z.string(),
      countryCode: z.string(),
      state: z.string(),
      stateCode: z.string(),
      zip: z.string(),
    }),
    logo: z.file().nullable(),
    base_currency: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword);
export const POST = withRateLimit(standardRateLimit)(async function POST(
  request: Request,
) {
  try {
    const isArtistOnboardingEnabled =
      (await fetchConfigCatValue("artistonboardingenabled", "low")) ?? false;

    if (!isArtistOnboardingEnabled) {
      throw new ServiceUnavailableError(
        "Artist onboarding is currently disabled",
      );
    }

    const isWaitlistFeatureActive =
      (await fetchConfigCatValue("waitlistActivated", "low")) ?? false;

    await connectMongoDB();

    const data = await validateRequestBody(request, RegisterSchema);

    if (isWaitlistFeatureActive) {
      if (!data.referrerKey || !data.inviteCode)
        throw new BadRequestError(
          "Invalid request parameters - Please try again or contact support",
        );

      // Check referrerKey and Invite code validity

      const isWaitlistUserInvitedAndValidated = await Waitlist.exists({
        referrerKe: data.referrerKey,
        inviteCode: data.inviteCode,
        email: data.email,
        isInvited: true,
        entity: "artist",
      });

      if (!isWaitlistUserInvitedAndValidated)
        throw new ForbiddenError(
          "Sign-up unavailable. Please join the waitlist or wait for an invite.",
        );
    }

    const userAgent: string = request.headers.get("User-Agent") ?? "";
    const authorization: string = request.headers.get("Authorization") ?? "";

    const isAccountRegistered = await AccountArtist.findOne(
      { email: data.email.toLowerCase() },
      "email",
    ).exec();

    if (isAccountRegistered)
      throw new ConflictError("Account already exists, please login");

    const parsedData = await parseRegisterData(data);

    const email_token = generateDigit(7);

    const saveData = await AccountArtist.create({
      ...parsedData,
      email: parsedData.email.toLowerCase(),
    });
    const { artist_id } = saveData;

    if (userAgent === process.env.MOBILE_USER_AGENT) {
      if (
        authorization === process.env.APP_AUTHORIZATION_SECRET &&
        data.device_push_token
      ) {
        await DeviceManagement.create({
          device_push_token: data.device_push_token,
          auth_id: artist_id,
        });
      }
    }

    if (!saveData)
      throw new ServerError("A server error has occured, please try again");

    const storeVerificationCode = await VerificationCodes.create({
      code: email_token,
      author: artist_id,
    });

    if (!storeVerificationCode)
      throw new ServerError("A server error has occured, please try again");

    await sendArtistSignupMail({
      name: saveData.name,
      email: saveData.email,
      token: email_token,
    });
    const tourRedisKey = `tour:${artist_id}`;

    // try {
    //   await redis.set(tourRedisKey, JSON.stringify([]));
    // } catch (error) {
    //   createErrorRollbarReport(
    //     "Artist Registeration: Error creating redis data for tours",
    //     JSON.stringify(error),
    //     500
    //   );
    // }
    return res.json(
      {
        message: "Artist successfully registered",
        data: artist_id,
      },
      { status: 201 },
    );
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);
    createErrorRollbarReport(
      "auth: artist register",
      error,
      error_response.status,
    );
    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status },
    );
  }
});
