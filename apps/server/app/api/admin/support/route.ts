import { NextResponse } from "next/server";
import { ClientSessionData } from "@omenai/shared-types";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import SupportTicket from "@omenai/shared-models/models/support/SupportTicketSchema";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { createErrorRollbarReport, getSessionData } from "../../util";
import { withRateLimit } from "@omenai/shared-lib/auth/middleware/rate_limit_middleware";
import { standardRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";

export const GET = withRateLimit(standardRateLimit)(async function GET(
  req: Request,
) {
  try {
    const { searchParams } = new URL(req.url);

    // const sessionData: ClientSessionData = await getSessionData();

    // console.log(sessionData);
    // if (!sessionData.isLoggedIn || sessionData.user?.role !== "admin") {
    //   return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    // }

    await connectMongoDB();

    // 2. Build Query Filters
    let query: any = {};

    const status = searchParams.get("status");
    if (status && status !== "ALL") query.status = status;

    const priority = searchParams.get("priority");
    if (priority && priority !== "ALL") query.priority = priority;

    const category = searchParams.get("category");
    if (category && category !== "ALL") query.category = category;

    // Optional: Search by Ticket ID
    const search = searchParams.get("search");
    if (search) {
      query.ticketId = { $regex: search, $options: "i" };
    }

    // 3. Pagination
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20"); // Admins usually need more rows
    const skip = (page - 1) * limit;

    // 4. Fetch
    const tickets = await SupportTicket.find(query)
      .sort({ createdAt: -1 }) // Newest first
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
});
