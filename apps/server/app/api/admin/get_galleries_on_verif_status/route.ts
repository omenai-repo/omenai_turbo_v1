import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { AccountGallery } from "@omenai/shared-models/models/auth/GallerySchema";
import { NextResponse } from "next/server";
import {
  BadRequestError,
  ServerError,
} from "../../../../custom/errors/dictionary/errorDictionary";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { strictRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";

export const POST = withRateLimitHighlightAndCsrf(strictRateLimit)(
  async function POST(request: Request) {
    const urlParam = new URL(request.url);
    const searchParam = urlParam.searchParams;
    try {
      const status = searchParam.get("status");

      if (!status) throw new BadRequestError("Invalid parameter - status");

      const status_bool: boolean = status === "true" ? true : false;

      await connectMongoDB();

      const galleries = await AccountGallery.find(
        { gallery_verified: status_bool, verified: true },
        "name address admin logo description email gallery_verified gallery_id status"
      );

      if (!galleries)
        throw new ServerError("Something went wrong, contact tech team");

      return NextResponse.json(
        { message: "Data retrieved", data: galleries },
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
