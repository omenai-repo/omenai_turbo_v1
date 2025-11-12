import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { NextResponse } from "next/server";
import { ServerError } from "../../../../custom/errors/dictionary/errorDictionary";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { AccountArtist } from "@omenai/shared-models/models/auth/ArtistSchema";
import { strictRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { CombinedConfig } from "@omenai/shared-types";
import { sendArtistBlockedMail } from "@omenai/shared-emails/src/models/artist/sendArtistBlockedMail";

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
    const { artist_id, status } = await request.json();

    const artist = await AccountArtist.findOne({ artist_id }, "name email");

    const block_artist = await AccountArtist.updateOne(
      { artist_id },
      { $set: { status } }
    );

    if (block_artist.modifiedCount === 0)
      throw new ServerError("Something went wrong");

    // TODO: Send mail to artist
    await sendArtistBlockedMail({ email: artist.email, name: artist.name });

    return NextResponse.json(
      { message: "Artist status updated" },
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
