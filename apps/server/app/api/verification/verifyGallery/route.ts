import { NextResponse } from "next/server";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { sendVerifyGalleryMail } from "@omenai/shared-emails/src/models/verification/sendVerifyGalleryMail";
import { fortKnoxRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { createErrorRollbarReport, validateRequestBody } from "../../util";
import z from "zod";
const Schema = z.object({
  name: z.string(),
});
export const POST = withRateLimitHighlightAndCsrf(fortKnoxRateLimit)(
  async function POST(request: Request) {
    try {
      const { name } = await validateRequestBody(request, Schema);

      await sendVerifyGalleryMail({ name, email: "moses@omenai.net" });

      return NextResponse.json(
        { message: "Gallery verification request sent" },
        { status: 200 },
      );
    } catch (error) {
      const error_response = handleErrorEdgeCases(error);
      createErrorRollbarReport(
        "verification: verify gallery",
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
