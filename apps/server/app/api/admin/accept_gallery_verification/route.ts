import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { NextResponse } from "next/server";
import { AccountGallery } from "@omenai/shared-models/models/auth/GallerySchema";
import {
  NotFoundError,
  ServerError,
} from "../../../../custom/errors/dictionary/errorDictionary";
import { sendGalleryAcceptedMail } from "@omenai/shared-emails/src/models/gallery/sendGalleryAcceptedMail";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { strictRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { CombinedConfig } from "@omenai/shared-types";

const config: CombinedConfig = {
  ...strictRateLimit,
  allowedRoles: ["admin"],
  allowedAdminAccessRoles: ["Admin", "Owner"],
};

export const POST = withRateLimitHighlightAndCsrf(config)(async function POST(
  request: Request
) {
  try {
    await connectMongoDB();
    const { gallery_id } = await request.json();

    if (!gallery_id)
      throw new ServerError("Invalid Parameters - Gallery ID is required");
    const get_gallery = await AccountGallery.findOne(
      { gallery_id },
      "name, email"
    );
    if (!get_gallery)
      throw new NotFoundError("Gallery not found for the given gallery ID");

    const { name, email } = get_gallery;

    const verify_gallery = await AccountGallery.updateOne(
      { gallery_id },
      { $set: { gallery_verified: true } }
    );

    if (verify_gallery.modifiedCount === 0)
      throw new ServerError("Something went wrong");

    // DONE: Send mail to gallery
    sendGalleryAcceptedMail({
      name,
      email,
    });

    return NextResponse.json(
      { message: "Gallery verification accepted" },
      { status: 200 }
    );
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);

    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status }
    );
  }
});
