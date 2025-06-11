import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { VerificationCodes } from "@omenai/shared-models/models/auth/verification/codeTimeoutSchema";
import { NextResponse } from "next/server";
import {
  ForbiddenError,
  BadRequestError,
} from "../../../../../custom/errors/dictionary/errorDictionary";
import { handleErrorEdgeCases } from "../../../../../custom/errors/handler/errorHandler";
import { AccountArtist } from "@omenai/shared-models/models/auth/ArtistSchema";
import { withAppRouterHighlight } from "@omenai/shared-lib/highlight/app_router_highlight";
import { strictRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitAndHighlight } from "@omenai/shared-lib/auth/middleware/combined_middleware";

export const POST = withRateLimitAndHighlight(strictRateLimit)(
  async function POST(request: Request) {
    const client = await connectMongoDB();
    const session = await client.startSession();
    try {
      const { params, token } = await request.json();

      const user = await AccountArtist.findOne(
        { artist_id: params },
        "verified"
      ).exec();

      if (user.verified)
        throw new ForbiddenError(
          "This action is not permitted, account already verified"
        );

      const isTokenActive = await VerificationCodes.findOne({
        author: params,
        code: token,
      }).exec();

      if (!isTokenActive) throw new BadRequestError("Invalid token data");

      try {
        session.startTransaction();
        await AccountArtist.updateOne(
          { artist_id: params },
          { verified: true }
        );

        await VerificationCodes.deleteOne({
          code: token,
          author: params,
        });
        await session.commitTransaction();
      } catch (error) {
        await session.abortTransaction();
      } finally {
        session.endSession();
      }

      return NextResponse.json(
        { message: "Verification was successful. Please login" },
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
