import { NextResponse } from "next/server";
import { getAllFairsAndEventsService } from "../../services/events/getEvents.service";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "12", 10);
    const filter = searchParams.get("filter") || "All";
    await connectMongoDB();

    const response = await getAllFairsAndEventsService(page, limit, filter);

    if (!response.isOk) {
      return NextResponse.json({ error: response.message }, { status: 500 });
    }

    return NextResponse.json(
      { data: response.data, pagination: response.pagination },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
