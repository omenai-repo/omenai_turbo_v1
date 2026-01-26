import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { LockMechanism } from "@omenai/shared-models/models/lock/LockSchema";
import { NextResponse } from "next/server";
import {
  ForbiddenError,
  ServerError,
} from "../../../../custom/errors/dictionary/errorDictionary";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { Artworkuploads } from "@omenai/shared-models/models/artworks/UploadArtworkSchema";

import { strictRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { CombinedConfig } from "@omenai/shared-types";
import { createErrorRollbarReport } from "../../util";

const config: CombinedConfig = {
  ...strictRateLimit,
  allowedRoles: ["user"],
};
export const POST = withRateLimitHighlightAndCsrf(config)(async function POST(
  request: Request,
) {
  try {
    await connectMongoDB();

    const { user_id, art_id } = await request.json();
    // Check the availability of the piece
    const is_piece_still_available = await Artworkuploads.findOne(
      { art_id },
      "availability",
    );

    if (!is_piece_still_available.availability)
      throw new ForbiddenError("Piece has been purchased by another collector");

    const checkIfLockActive = await LockMechanism.findOne({ art_id });

    if (checkIfLockActive) {
      return NextResponse.json(
        {
          message:
            "A user is currently processing a transaction on this piece. Please refersh your page in 10 minutes to check availability of the artwork",
          data: { lock_data: checkIfLockActive },
        },
        { status: 200 },
      );
    }
    const createLock = await LockMechanism.create({ art_id, user_id });

    if (!createLock)
      throw new ServerError("An error was encountered. Please try again");

    const getLock = await LockMechanism.findOne({ art_id });

    return NextResponse.json(
      {
        message: "Purchase Lock acquired",
        data: { lock_data: getLock },
      },
      { status: 200 },
    );
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);
    createErrorRollbarReport(
      "locks: create Lock",
      error,
      error_response.status,
    );
    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status },
    );
  }
});
