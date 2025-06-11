import { hashPassword } from "@omenai/shared-lib/hash/hashPassword";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { AccountGallery } from "@omenai/shared-models/models/auth/GallerySchema";
import { VerificationCodes } from "@omenai/shared-models/models/auth/verification/codeTimeoutSchema";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import {
  BadRequestError,
  ConflictError,
  ServerError,
} from "../../../../../custom/errors/dictionary/errorDictionary";
import { handleErrorEdgeCases } from "../../../../../custom/errors/handler/errorHandler";
import { withAppRouterHighlight } from "@omenai/shared-lib/highlight/app_router_highlight";
import { strictRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitAndHighlight } from "@omenai/shared-lib/auth/middleware/combined_middleware";

export const POST = withRateLimitAndHighlight(strictRateLimit)(
  async function POST(request: Request) {
    try {
      await connectMongoDB();

      const { password, id } = await request.json();

      const user = await VerificationCodes.findOne(
        { code: id },
        "author"
      ).exec();

      if (!user)
        throw new BadRequestError("Token invalid. This link is not usable");

      const filter = { gallery_id: user.author };

      const account = await AccountGallery.findOne(
        { gallery_id: user.author },
        "password"
      );

      const isPasswordMatch = bcrypt.compareSync(password, account.password);

      if (isPasswordMatch)
        throw new ConflictError(
          "Your new password cannot be identical to a previously used password"
        );

      const hash = await hashPassword(password);

      if (!hash)
        throw new ServerError("A server error has occured, please try again");

      const update = { password: hash };

      const updateAccountInfo = await AccountGallery.updateOne(filter, update);

      if (updateAccountInfo.modifiedCount === 0)
        throw new ServerError("A server error has occured, please try again");

      await VerificationCodes.findOneAndDelete({ code: id });
      return NextResponse.json(
        { message: "Password updated! Please login with new credentials." },
        { status: 200 }
      );
    } catch (error) {
      const error_response = handleErrorEdgeCases(error);

      return NextResponse.json(
        { message: error_response?.message },
        { status: error_response?.status }
      );
    }
  }
);
