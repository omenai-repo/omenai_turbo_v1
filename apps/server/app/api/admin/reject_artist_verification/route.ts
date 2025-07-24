import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { RejectedGallery } from "@omenai/shared-models/models/auth/RejectedGalleryScema";
import { NextResponse } from "next/server";
import { ServerError } from "../../../../custom/errors/dictionary/errorDictionary";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { sendArtistRejectedMail } from "@omenai/shared-emails/src/models/artist/sendArtistRejectionMail";
import { AccountArtist } from "@omenai/shared-models/models/auth/ArtistSchema";
import { strictRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { CombinedConfig } from "@omenai/shared-types";
const config: CombinedConfig = {
  ...strictRateLimit,
  allowedRoles: ["admin"],
  allowedAdminAccessRoles: ["admin", "owner"],
};

export const POST = withRateLimitHighlightAndCsrf(config)(async function POST(
  request: Request
) {
  try {
    await connectMongoDB();
    const { artist_id, name, email } = await request.json();

    const add_to_rejected = await RejectedGallery.create({ name, email });

    if (!add_to_rejected) throw new ServerError("Something went wrong");

    const delete_artist_info = await AccountArtist.deleteOne({ artist_id });

    if (!delete_artist_info) throw new ServerError("Something went wrong");

    // TODO: Send mail to gallery
    await sendArtistRejectedMail({
      name,
      email,
    });

    return NextResponse.json(
      { message: "Artist verification rejected" },
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
