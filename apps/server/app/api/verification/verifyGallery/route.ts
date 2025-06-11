import { getIp } from "@omenai/shared-lib/auth/getIp";
import { NextResponse } from "next/server";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { sendVerifyGalleryMail } from "@omenai/shared-emails/src/models/verification/sendVerifyGalleryMail";
import { strictRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitAndHighlight } from "@omenai/shared-lib/auth/middleware/combined_middleware";
export const POST = withRateLimitAndHighlight(strictRateLimit)(
  async function POST(request: Request) {
    try {
      const { name } = await request.json();

      const ip = await getIp();

      await sendVerifyGalleryMail({ name, email: "moses@omenai.net" });

      return NextResponse.json(
        { message: "Gallery verification request sent" },
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
