import { NextResponse } from "next/server";
import { ClientSessionData } from "@omenai/shared-types";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import SupportTicket from "@omenai/shared-models/models/support/SupportTicketSchema";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { createErrorRollbarReport, getSessionData } from "../../util";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionData: ClientSessionData = await getSessionData();

    // 1. Auth Check
    if (!sessionData.isLoggedIn || !sessionData.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectMongoDB();

    const query = { userId: sessionData.user.id };

    // 3. Pagination
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // 4. Fetch
    const tickets = await SupportTicket.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalCount = await SupportTicket.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: tickets,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
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
