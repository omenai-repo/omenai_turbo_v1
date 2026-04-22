import { NextResponse } from "next/server";
import { getIndividualFairOrEventService } from "../../services/events/getEvents.service";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const eventId = searchParams.get("event_id");
  try {
    if (!eventId) {
      return NextResponse.json(
        { error: "Event ID is required" },
        { status: 400 },
      );
    }

    await connectMongoDB();

    const response = await getIndividualFairOrEventService(eventId);

    if (!response.isOk || !response.data) {
      return NextResponse.json(
        { error: response.message || "Not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ data: response.data }, { status: 200 });
  } catch (error) {
    console.error("API Route Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
