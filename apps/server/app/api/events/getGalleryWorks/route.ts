import { NextResponse } from "next/server";
import { getAllFairsAndEventsService } from "../../services/events/getEvents.service";
import { getGalleryWorksService } from "../../services/events/getGalleryWorks.service";
import { BadRequestError } from "../../../../custom/errors/dictionary/errorDictionary";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "20", 10);
  const gallery_id = searchParams.get("id");

  const filters = {
    artist: searchParams.get("artist") || undefined,
    medium: searchParams.get("medium") || undefined,
    price: searchParams.get("price") || undefined,
  };
  try {
    if (!gallery_id) throw new BadRequestError("Missing id parameter");
    await connectMongoDB();
    const response = await getGalleryWorksService(
      gallery_id,
      page,
      limit,
      filters,
    );

    if (!response.isOk) {
      return NextResponse.json({ error: response.message }, { status: 500 });
    }

    return NextResponse.json(
      { data: response.data, pagination: response.pagination },
      { status: 200 },
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
