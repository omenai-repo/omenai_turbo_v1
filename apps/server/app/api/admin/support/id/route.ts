import { NextResponse } from "next/server";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import SupportTicket from "@omenai/shared-models/models/support/SupportTicketSchema";
import { handleErrorEdgeCases } from "../../../../../custom/errors/handler/errorHandler";
import { createErrorRollbarReport } from "../../../util";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    // DEBUGGING: Check what the server actually receives
    console.log("--- DEBUG SUPPORT TICKET FETCH ---");
    console.log("Raw ID from URL:", id);

    if (!id) {
      return NextResponse.json(
        { error: "Ticket ID is required" },
        { status: 400 },
      );
    }

    await connectMongoDB();

    // 1. Normalize: Force lowercase and trim just to be safe
    // This matches the new 'om_12345' format
    const cleanId = id.trim();

    console.log("Searching DB for:", cleanId);

    // 2. Simple Exact Match
    // Since we are now saving strictly as 'om_xxxxx', we don't need complex regex
    const ticket = await SupportTicket.findOne({ ticketId: cleanId }).lean();

    console.log("Found Ticket?", ticket);
    console.log("----------------------------------");

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: ticket }, { status: 200 });
  } catch (error) {
    console.error("Server Error:", error);
    const error_response = handleErrorEdgeCases(error);
    createErrorRollbarReport(
      "admin: update admin credentials",
      error,
      error_response?.status,
    );
    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status },
    );
  }
}
