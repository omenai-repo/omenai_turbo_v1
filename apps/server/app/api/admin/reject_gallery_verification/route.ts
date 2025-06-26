import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { AccountGallery } from "@omenai/shared-models/models/auth/GallerySchema";
import { RejectedGallery } from "@omenai/shared-models/models/auth/RejectedGalleryScema";
import { NextResponse } from "next/server";
import { ServerError } from "../../../../custom/errors/dictionary/errorDictionary";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { sendGalleryRejectedMail } from "@omenai/shared-emails/src/models/gallery/sendGalleryRejectionMail";
import { strictRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { CombinedConfig } from "@omenai/shared-types";

const config: CombinedConfig = {
  ...strictRateLimit,
  allowedRoles: ["admin"],
};

export const POST = withRateLimitHighlightAndCsrf(config)(async function POST(
  request: Request
) {
  try {
    await connectMongoDB();
    const { gallery_id, name, email } = await request.json();

    const add_to_rejected = await RejectedGallery.create({ name, email });

    if (!add_to_rejected) throw new ServerError("Something went wrong");

    const delete_gallery_info = await AccountGallery.deleteOne({
      gallery_id,
    });

    if (!delete_gallery_info) throw new ServerError("Something went wrong");

    // TODO: Send mail to gallery
    await sendGalleryRejectedMail({
      name,
      email,
    });

    return NextResponse.json(
      { message: "Gallery verification rejected" },
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
