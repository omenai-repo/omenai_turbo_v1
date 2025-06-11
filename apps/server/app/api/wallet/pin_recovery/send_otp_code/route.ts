import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { VerificationCodes } from "@omenai/shared-models/models/auth/verification/codeTimeoutSchema";
import { generateDigit } from "@omenai/shared-utils/src/generateToken";
import { NextResponse } from "next/server";
import { NotFoundError } from "../../../../../custom/errors/dictionary/errorDictionary";
import { handleErrorEdgeCases } from "../../../../../custom/errors/handler/errorHandler";
import { sendPinUpdateCode } from "@omenai/shared-emails/src/models/wallet/sendPinUpdateCode";
import { AccountArtist } from "@omenai/shared-models/models/auth/ArtistSchema";
import { withAppRouterHighlight } from "@omenai/shared-lib/highlight/app_router_highlight";
import { strictRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitAndHighlight } from "@omenai/shared-lib/auth/middleware/combined_middleware";
export const POST = withRateLimitAndHighlight(strictRateLimit)(
  async function POST(request: Request) {
    try {
      await connectMongoDB();
      const { artist_id } = await request.json();

      const account = await AccountArtist.findOne({
        artist_id,
      });
      if (!account) throw new NotFoundError("Artist not found for given ID");
      const token = generateDigit(4);
      const isCodeActive = await VerificationCodes.findOne({
        author: artist_id,
      });

      if (isCodeActive)
        await VerificationCodes.deleteOne({ author: artist_id });

      const create_code = await VerificationCodes.create({
        code: token,
        author: account.artist_id,
      });

      if (!create_code)
        throw new Error(
          "Something went wrong with this request, Please contact support."
        );

      await sendPinUpdateCode({
        username: account.name,
        token: token,
        email: account.email,
      });

      return NextResponse.json(
        { message: "Pin reset otp code sent to email address" },
        { status: 200 }
      );
    } catch (error) {
      console.log(error);
      const error_response = handleErrorEdgeCases(error);

      return NextResponse.json(
        { message: error_response?.message },
        { status: error_response?.status }
      );
    }
  }
);
