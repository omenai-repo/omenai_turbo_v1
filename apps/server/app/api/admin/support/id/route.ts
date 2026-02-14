import { NextResponse } from "next/server";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import SupportTicket from "@omenai/shared-models/models/support/SupportTicketSchema";
import { handleErrorEdgeCases } from "../../../../../custom/errors/handler/errorHandler";
import {
  createErrorRollbarReport,
  validateGetRouteParams,
} from "../../../util";
import z from "zod";

const SupportIdSchema = z.object({
  ticketId: z.string().min(1).trim(),
});
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const { ticketId } = validateGetRouteParams(SupportIdSchema, {
      ticketId: id,
    });

    await connectMongoDB();
    const ticket = await SupportTicket.findOne({ ticketId }).lean();

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
