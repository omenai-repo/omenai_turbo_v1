import { NextResponse } from "next/server";
import { ClientSessionData } from "@omenai/shared-types";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import SupportTicket from "@omenai/shared-models/models/support/SupportTicketSchema";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { createErrorRollbarReport, getSessionData } from "../../util";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    await connectMongoDB();

    // 1. Base Query (Scoped to User)
    const userId = searchParams.get("id");

    const query: any = { userId };

    // 2. Add Filters
    const status = searchParams.get("status");
    if (status && status !== "ALL") query.status = status;

    const priority = searchParams.get("priority");
    if (priority && priority !== "ALL") query.priority = priority;

    const search = searchParams.get("search");

    if (search) {
      // Search by Ticket ID or Message content
      query.$or = [
        { ticketId: { $regex: search, $options: "i" } },
        { message: { $regex: search, $options: "i" } },
      ];
    }

    const year = searchParams.get("year");
    if (year && year !== "ALL") {
      const startDate = new Date(`${year}-01-01`);
      const endDate = new Date(`${year}-12-31T23:59:59.999Z`);
      query.createdAt = { $gte: startDate, $lte: endDate };
    }

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
      "user: fetch support tickets",
      error,
      error_response?.status,
    );
    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status },
    );
  }
}
