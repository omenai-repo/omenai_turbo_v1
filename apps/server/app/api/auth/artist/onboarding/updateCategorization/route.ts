import { ArtistCategorization } from "@omenai/shared-models/models/artist/ArtistCategorizationSchema";
import {
  ArtistAlgorithmSchemaTypes,
  ArtistCategory,
  ArtistCategorizationAlgorithmResult,
  ArtistCategorizationUpdateDataTypes,
} from "@omenai/shared-types";
import { NextResponse } from "next/server";

import { AccountArtist } from "@omenai/shared-models/models/auth/ArtistSchema";
import { calculateArtistRating } from "@omenai/shared-lib/algorithms/artistCategorization";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { sendVerifyArtistMail } from "@omenai/shared-emails/src/models/verification/sendVerifyArtistMail";
import {
  BadRequestError,
  NotFoundError,
  ServerError,
} from "../../../../../../custom/errors/dictionary/errorDictionary";
import { handleErrorEdgeCases } from "../../../../../../custom/errors/handler/errorHandler";
import { strictRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { createErrorRollbarReport } from "../../../../util";

export const POST = withRateLimitHighlightAndCsrf(strictRateLimit)(
  async function POST(request: Request) {
    const client = await connectMongoDB();
    const session = await client.startSession();
    try {
      session.startTransaction();

      const data: ArtistCategorizationUpdateDataTypes = await request.json();

      if (!data.answers || !data.artist_id || !data.bio)
        throw new BadRequestError("Invalid data parameters");

      const artist = await AccountArtist.findOne({ artist_id: data.artist_id });

      if (!artist) throw new BadRequestError("Artist not found. Invalid ID");

      // Check if artist categorization is determined
      const is_algorithmCalculated = await ArtistCategorization.findOne({
        artist_id: artist.artist_id,
      });

      if (!is_algorithmCalculated)
        throw new NotFoundError(
          "Data not found for update, please try again or contact support",
        );

      const algorithm_result: ArtistCategorizationAlgorithmResult =
        calculateArtistRating(data.answers);

      if (algorithm_result.status !== "success")
        throw new ServerError(
          "Something went wrong while processing data, please contact support",
        );

      // Create algorithm save structure
      const categorization_result_payload: Pick<
        ArtistAlgorithmSchemaTypes,
        "request"
      > = {
        request: {
          date: new Date(),
          categorization: {
            artist_categorization: algorithm_result.rating as
              | ArtistCategory
              | "Unknown",
            answers: data.answers,
            price_range: algorithm_result.price_range,
          },
        },
      };

      await ArtistCategorization.updateOne(
        { artist_id: artist.artist_id },
        {
          $set: {
            request: categorization_result_payload.request,
          },
        },
      ).session(session);

      await session.commitTransaction();

      // TODO: Replace email with actual admin email
      await sendVerifyArtistMail({
        name: artist.name,
        email: "support@omenai.app",
      });

      return NextResponse.json(
        { message: "Algorithm ran successfully" },
        { status: 200 },
      );
    } catch (error) {
      await session.abortTransaction();
      const error_response = handleErrorEdgeCases(error);
      createErrorRollbarReport(
        "auth: artist onboarding update categorization",
        error,
        error_response.status,
      );
      return NextResponse.json(
        { message: error_response!.message },
        { status: error_response!.status },
      );
    } finally {
      await session.endSession();
    }
  },
);
