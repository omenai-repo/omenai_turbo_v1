import { hashPassword } from "@omenai/shared-lib/hash/hashPassword";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { AccountGallery } from "@omenai/shared-models/models/auth/GallerySchema";
import { VerificationCodes } from "@omenai/shared-models/models/auth/verification/codeTimeoutSchema";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import {
  ServerError,
  ConflictError,
} from "../../../../../custom/errors/dictionary/errorDictionary";
import { handleErrorEdgeCases } from "../../../../../custom/errors/handler/errorHandler";
import { strictRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { CombinedConfig } from "@omenai/shared-types";
import { createErrorRollbarReport, validateRequestBody } from "../../../util";
import z from "zod";

const config: CombinedConfig = {
  ...strictRateLimit,
  allowedRoles: ["gallery"],
};
const UpdatePasswordSchema = z.object({
  id: z.string(),
  password: z.string(),
  code: z.string(),
});
export const POST = withRateLimitHighlightAndCsrf(config)(async function POST(
  request: Request,
) {
  try {
    const { id, password, code } = await validateRequestBody(
      request,
      UpdatePasswordSchema,
    );
    const client = await connectMongoDB();
    const session = await client.startSession();
    const account = await AccountGallery.findOne(
      {
        gallery_id: id,
      },
      "password",
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
        "Your password cannot be identical to your previous password",
      );

    const hashedPassword = await hashPassword(password);

    try {
      session.startTransaction();
      const updatePassword = await AccountGallery.updateOne(
        { gallery_id: id },
        { $set: { password: hashedPassword } },
      );

      const delete_code = await VerificationCodes.deleteOne({
        code,
      });

      await Promise.all([updatePassword, delete_code]);

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      createErrorRollbarReport("gallery: update gallery password", error, 500);
    } finally {
      await session.endSession();
    }

    return NextResponse.json(
      { message: "Password updated successfully" },
      { status: 200 },
    );
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);
    createErrorRollbarReport(
      "gallery: update password",
      error,
      error_response.status,
    );
    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status },
    );
  }
});
