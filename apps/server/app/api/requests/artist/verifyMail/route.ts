import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { VerificationCodes } from "@omenai/shared-models/models/auth/verification/codeTimeoutSchema";
import { NextResponse } from "next/server";
import {
  ForbiddenError,
  BadRequestError,
} from "../../../../../custom/errors/dictionary/errorDictionary";
import { handleErrorEdgeCases } from "../../../../../custom/errors/handler/errorHandler";
import { AccountArtist } from "@omenai/shared-models/models/auth/ArtistSchema";
import { strictRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { createErrorRollbarReport, validateRequestBody } from "../../../util";
import z from "zod";
const VerifyMailSchema = z.object({
  params: z.string(),
  token: z.string(),
});
export const POST = withRateLimitHighlightAndCsrf(strictRateLimit)(
  async function POST(request: Request) {
    const client = await connectMongoDB();
    const session = await client.startSession();
    try {
      const { params, token } = await validateRequestBody(
        request,
        VerifyMailSchema,
      );

      const user = await AccountArtist.findOne(
        { artist_id: params },
        "verified",
      ).exec();

      if (user.verified)
        throw new ForbiddenError(
          "This action is not permitted, account already verified",
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
          { verified: true },
        );

        await VerificationCodes.deleteOne({
          code: token,
          author: params,
        });
        await session.commitTransaction();
      } catch (error) {
        await session.abortTransaction();
        createErrorRollbarReport(
          "artist: failed to update account artist",
          error,
          500,
        );
      } finally {
        session.endSession();
      }

      return NextResponse.json(
        { message: "Verification was successful. Please login" },
        { status: 200 },
      );
    } catch (error) {
      const error_response = handleErrorEdgeCases(error);
      createErrorRollbarReport(
        "artist: verify mail",
        error,
        error_response.status,
      );
      return NextResponse.json(
        { message: error_response?.message },
        { status: error_response?.status },
      );
    }
  },
);
