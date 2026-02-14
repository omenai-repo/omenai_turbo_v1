import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { AccountGallery } from "@omenai/shared-models/models/auth/GallerySchema";
import { NextResponse } from "next/server";
import { ServerError } from "../../../../custom/errors/dictionary/errorDictionary";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { strictRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { CombinedConfig } from "@omenai/shared-types";
import { sendGalleryBlockedEmail } from "@omenai/shared-emails/src/models/gallery/sendGalleryBlockedEmail";
import { createErrorRollbarReport, validateRequestBody } from "../../util";
import z from "zod";

const config: CombinedConfig = {
  ...strictRateLimit,
  allowedRoles: ["admin"],
  allowedAdminAccessRoles: ["Admin", "Owner"],
};

const BlockGallerySchema = z.object({
  gallery_id: z.string(),
  status: z.string(),
});

export const POST = withRateLimitHighlightAndCsrf(config)(async function POST(
  request: Request,
) {
  try {
    await connectMongoDB();
    const { gallery_id, status } = await validateRequestBody(
      request,
      BlockGallerySchema,
    );

    const gallery = await AccountGallery.findOne({ gallery_id }, "name email");

    const block_gallery = await AccountGallery.updateOne(
      { gallery_id },
      { $set: { status } },
    );

    if (block_gallery.modifiedCount === 0)
      throw new ServerError("Something went wrong");

    await sendGalleryBlockedEmail({ name: gallery.name, email: gallery.email });

    return NextResponse.json(
      { message: "Gallery status updated" },
      { status: 200 },
    );
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);
    createErrorRollbarReport(
      "admin: block gallery",
      error,
      error_response?.status,
    );

    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status },
    );
  }
});
