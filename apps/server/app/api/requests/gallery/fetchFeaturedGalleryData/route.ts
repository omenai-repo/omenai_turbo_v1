import { lenientRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { NextResponse } from "next/server";
import { handleErrorEdgeCases } from "../../../../../custom/errors/handler/errorHandler";
import { Artworkuploads } from "@omenai/shared-models/models/artworks/UploadArtworkSchema";
import { AccountGallery } from "@omenai/shared-models/models/auth/GallerySchema";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import {
  createErrorRollbarReport,
  validateGetRouteParams,
} from "../../../util";
import z from "zod";

const FeatFeaturedGallerySchema = z.object({
  gallery_id: z.string(),
  page: z.string().default("1"),
});
export const GET = withRateLimitHighlightAndCsrf(lenientRateLimit)(
  async function GET(request: Request) {
    const url = new URL(request.url);
    const searchParams = url.searchParams;
    const gallery_idParams = searchParams.get("id");
    const pageParams = searchParams.get("page") || "1";

    try {
      const { gallery_id, page } = validateGetRouteParams(
        FeatFeaturedGallerySchema,
        { gallery_id: gallery_idParams, page: pageParams },
      );
      await connectMongoDB();

      const skip = (Number(page) - 1) * 20;

      const gallery_data = await AccountGallery.find(
        { gallery_id },
        "logo name description",
      );

      if (!gallery_data || gallery_data.length === 0) {
        return NextResponse.json(
          { message: "Gallery not found" },
          { status: 404 },
        );
      }
      const artworksForGallery = await Artworkuploads.find(
        { author_id: gallery_id },
        "art_id title url artist",
      )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(20)
        .exec();

      return NextResponse.json({
        message: "Featured gallery data fetched",
        data: gallery_data,
        gallery_artworks: artworksForGallery,
      });
    } catch (error) {
      const error_response = handleErrorEdgeCases(error);
      createErrorRollbarReport(
        "gallery: fetch featured gallery data",
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
