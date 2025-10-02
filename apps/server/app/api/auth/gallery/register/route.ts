import { parseRegisterData } from "@omenai/shared-lib/auth/parseRegisterData";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { AccountGallery } from "@omenai/shared-models/models/auth/GallerySchema";
import { RejectedGallery } from "@omenai/shared-models/models/auth/RejectedGalleryScema";
import { VerificationCodes } from "@omenai/shared-models/models/auth/verification/codeTimeoutSchema";
import { generateDigit } from "@omenai/shared-utils/src/generateToken";
import { NextResponse } from "next/server";
import {
  ConflictError,
  ServerError,
} from "../../../../../custom/errors/dictionary/errorDictionary";
import { handleErrorEdgeCases } from "../../../../../custom/errors/handler/errorHandler";
import { sendGalleryMail } from "@omenai/shared-emails/src/models/gallery/sendGalleryMail";
import { strictRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { DeviceManagement } from "@omenai/shared-models/models/device_management/DeviceManagementSchema";

export const POST = withRateLimitHighlightAndCsrf(strictRateLimit)(
  async function POST(request: Request) {
    try {
      await connectMongoDB();

      const data = await request.json();

      const isAccountRegistered = await AccountGallery.findOne({
        email: data.email.toLowerCase(),
      }).exec();

      if (isAccountRegistered)
        throw new ConflictError("Account already exists, please login");

      const isAccountRejected = await RejectedGallery.findOne({
        email: data.email.toLowerCase(),
      }).exec();

      if (isAccountRejected)
        throw new ConflictError(
          "Unfortunately, you cannot create an account with us at this time. Please contact support."
        );

      const parsedData = await parseRegisterData(data);

      const email_token = generateDigit(7);

      const saveData = await AccountGallery.create({
        ...parsedData,
        email: parsedData.email.toLowerCase(),
      });

      const { gallery_id, email, name } = saveData;

      if (!saveData)
        throw new ServerError("A server error has occured, please try again");

      const userAgent: string = request.headers.get("User-Agent") ?? "";
      const authorization: string = request.headers.get("Authorization") ?? "";

      if (userAgent === process.env.MOBILE_USER_AGENT) {
        if (
          authorization === process.env.APP_AUTHORIZATION_SECRET &&
          data.device_push_token
        ) {
          await DeviceManagement.create({
            device_push_token: data.device_push_token,
            auth_id: gallery_id,
          });
        }
      }
      const storeVerificationCode = await VerificationCodes.create({
        code: email_token,
        author: saveData.gallery_id,
      });

      if (!storeVerificationCode)
        throw new ServerError("A server error has occured, please try again");

      await sendGalleryMail({
        name: name,
        email: email,
        token: email_token,
      });

      return NextResponse.json(
        {
          message: "Account successfully registered",
          data: gallery_id,
        },
        { status: 201 }
      );
    } catch (error) {
      const error_response = handleErrorEdgeCases(error);
      console.log(error);

      return NextResponse.json(
        { message: error_response?.message },
        { status: error_response?.status }
      );
    }
  }
);
