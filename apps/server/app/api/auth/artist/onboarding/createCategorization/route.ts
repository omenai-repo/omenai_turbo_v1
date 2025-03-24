import { ArtistCategorization } from "@omenai/shared-models/models/artist/ArtistCategorizationSchema";
import { sendVerifyArtistMail } from "@omenai/shared-emails/src/models/verification/sendVerifyArtistMail";

import {
  ArtistAlgorithmSchemaTypes,
  ArtistCategory,
  ArtistCategorizationAlgorithmResult,
  ArtistCategorizationUpdateDataTypes,
} from "@omenai/shared-types";
import { NextRequest, NextResponse } from "next/server";

import { AccountArtist } from "@omenai/shared-models/models/auth/ArtistSchema";
import { calculateArtistRating } from "@omenai/shared-lib/algorithms/artistCategorization";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import {
  BadRequestError,
  ForbiddenError,
  ServerError,
} from "../../../../../../custom/errors/dictionary/errorDictionary";
import { handleErrorEdgeCases } from "../../../../../../custom/errors/handler/errorHandler";

export async function POST(request: NextRequest) {
  const client = await connectMongoDB();
  const session = await client.startSession();
  try {
    session.startTransaction();

    const data: ArtistCategorizationUpdateDataTypes = await request.json();

    if (!data.answers || !data.artist_id || !data.bio || !data.documentation)
      throw new BadRequestError("Invalid data parameters");

    const artist = await AccountArtist.findOne({ artist_id: data.artist_id });

    if (!artist) throw new BadRequestError("Artist not found. Invalid ID");

    // Check if artist categorization is determined
    const is_algorithmCalculated = await ArtistCategorization.findOne({
      artist_id: artist.artist_id,
    });

    if (is_algorithmCalculated)
      throw new ForbiddenError(
        "Categorization determined. Please update if necessary"
      );

    // Calculate new algorithm
    const algorithm_result: ArtistCategorizationAlgorithmResult =
      calculateArtistRating(data.answers);

    if (algorithm_result.status !== "success")
      throw new ServerError(
        "Something went wrong while processing data, please contact support"
      );

    // Create algorithm save structure
    const categorizationSchemaData: ArtistAlgorithmSchemaTypes = {
      artist_id: artist.artist_id,
      history: [],
      current: null,
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

    await ArtistCategorization.create([categorizationSchemaData], {
      session,
    });

    await AccountArtist.updateOne(
      { artist_id: data.artist_id },
      {
        $set: {
          documentation: data.documentation,
          bio: data.bio,
          isOnboardingCompleted: true,
        },
      }
    ).session(session);

    await session.commitTransaction();

    await sendVerifyArtistMail({
      name: artist.name,
      email: "moses@omenai.net",
    });

    return NextResponse.json(
      { message: "Categorization Algorithm ran successfully" },
      { status: 200 }
    );
  } catch (error) {
    await session.abortTransaction();
    const error_response = handleErrorEdgeCases(error);

    return NextResponse.json(
      { message: error_response!.message },
      { status: error_response!.status }
    );
  } finally {
    await session.endSession();
  }
}

// TODO:       // Update artist bio etc
// await AccountArtist.updateOne(
//   { artist_id: artist.artist_id },
//   {
//     $set: {
//       bio: data.bio,
//       algo_data_id: create_categorization[0].id,
//       categorization:
//         create_categorization[0].categorization.artist_categorization,
//     },
//   }
// ).session(session);
