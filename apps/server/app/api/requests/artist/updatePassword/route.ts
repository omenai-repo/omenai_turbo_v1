import { hashPassword } from "@omenai/shared-lib/hash/hashPassword";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { VerificationCodes } from "@omenai/shared-models/models/auth/verification/codeTimeoutSchema";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import {
  ServerError,
  ConflictError,
} from "../../../../../custom/errors/dictionary/errorDictionary";
import { handleErrorEdgeCases } from "../../../../../custom/errors/handler/errorHandler";
import { AccountArtist } from "@omenai/shared-models/models/auth/ArtistSchema";
import { withAppRouterHighlight } from "@omenai/shared-lib/highlight/app_router_highlight";
import { strictRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { CombinedConfig } from "@omenai/shared-types";
import { createErrorRollbarReport } from "../../../util";
const config: CombinedConfig = {
  ...strictRateLimit,
  allowedRoles: ["artist"],
};
export const POST = withRateLimitHighlightAndCsrf(config)(async function POST(
  request: Request
) {
  try {
    await connectMongoDB();

    const { id, password, code } = await request.json();

    const account = await AccountArtist.findOne(
      {
        artist_id: id,
      },
      "password"
    );

    if (!account) throw new ServerError("Something went wrong");

    const check_code_existence = await VerificationCodes.findOne({
      code,
    });

    if (!check_code_existence)
      throw new ConflictError("Code invalid, please try again");

    const isPasswordMatch = bcrypt.compareSync(password, account.password);

    if (isPasswordMatch)
      throw new ConflictError(
        "Your password cannot be identical to your previous password"
      );

    const hashedPassword = await hashPassword(password);

    const updatePassword = await AccountArtist.updateOne(
      { artist_id: id },
      { $set: { password: hashedPassword } }
    );

    if (updatePassword.modifiedCount === 0)
      throw new ServerError(
        "Something went wrong with this request, Please contact support."
      );

    const delete_code = await VerificationCodes.deleteOne({
      code,
    });

    if (!delete_code)
      throw new Error(
        "Something went wrong with this request, Please contact support."
      );

    return NextResponse.json(
      { message: "Password updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);
    createErrorRollbarReport(
      "artist: update password",
      error,
      error_response.status
    );
    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status }
    );
  }
});
