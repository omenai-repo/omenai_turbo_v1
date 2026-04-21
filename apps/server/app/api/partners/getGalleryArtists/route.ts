import { NextResponse } from "next/server";
import { getGalleryArtistsService } from "../../services/gallery/partners/getGalleryArtists.service";
import { BadRequestError } from "../../../../custom/errors/dictionary/errorDictionary";
import { withRateLimit } from "@omenai/shared-lib/auth/middleware/rate_limit_middleware";
import { standardRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";

export const GET = withRateLimit(standardRateLimit)(async function GET(
  request: Request,
) {
  const { searchParams } = new URL(request.url);
  const galleryId = searchParams.get("id");
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "5", 10);
  const artist = searchParams.get("artist") || undefined;
  try {
    if (!galleryId) throw new BadRequestError("Invalid ID provided");

    const response = await getGalleryArtistsService(
      galleryId,
      page,
      limit,
      artist,
    );

    if (!response.isOk) {
      return NextResponse.json({ error: response.message }, { status: 500 });
    }

    console.log(response.data?.length);

    return NextResponse.json(
      {
        data: response.data,
        pagination: response.pagination,
      },
      { status: 200 },
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
});
