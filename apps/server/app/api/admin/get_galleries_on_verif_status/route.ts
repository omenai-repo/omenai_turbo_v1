import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { AccountGallery } from "@omenai/shared-models/models/auth/GallerySchema";
import { NextResponse } from "next/server";
import {
  BadRequestError,
  ServerError,
} from "../../../../custom/errors/dictionary/errorDictionary";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import {
  lenientRateLimit,
  strictRateLimit,
} from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";

export const GET = withRateLimitHighlightAndCsrf(lenientRateLimit)(
  async function GET(request: Request) {
    try {
      await connectMongoDB();

      const gallery_data = await AccountGallery.find(
        {},
        "name address admin logo description email gallery_verified gallery_id status"
      );

      if (!gallery_data)
        throw new ServerError("Something went wrong, contact tech team");

      return NextResponse.json(
        { message: "Data retrieved", data: gallery_data },
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
