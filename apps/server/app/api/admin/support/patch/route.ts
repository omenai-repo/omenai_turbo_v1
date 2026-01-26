import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import SupportTicket from "@omenai/shared-models/models/support/SupportTicketSchema";
import { NextResponse } from "next/server";
import { handleErrorEdgeCases } from "../../../../../custom/errors/handler/errorHandler";
import { createErrorRollbarReport } from "../../../util";

// PATCH: Update Status or Priority
export async function PATCH(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    const body = await req.json();
    const { status, priority } = body;

    await connectMongoDB();

    const updatedTicket = await SupportTicket.findOneAndUpdate(
      { ticketId: id },
      {
        $set: {
          ...(status && { status }),
          ...(priority && { priority }),
          updatedAt: new Date(),
        },
      },
      { new: true },
    );

    return NextResponse.json({ success: true, data: updatedTicket });
  } catch (error) {
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
