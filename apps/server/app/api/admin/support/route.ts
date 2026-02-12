import { NextResponse } from "next/server";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import SupportTicket from "@omenai/shared-models/models/support/SupportTicketSchema";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { createErrorRollbarReport, validateGetRouteParams } from "../../util";
import { withRateLimit } from "@omenai/shared-lib/auth/middleware/rate_limit_middleware";
import { standardRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import z from "zod";
const SupportSchema = z.object({
  status: z.string().min(1),
  priority: z.string().min(1),
  category: z.string().min(1),
  search: z.string().optional(),
  page: z.number(),
  limit: z.number(),
});
export const GET = withRateLimit(standardRateLimit)(async function GET(
  req: Request,
) {
  try {
    const { searchParams } = new URL(req.url);
    const statusParams = searchParams.get("status");
    const priorityParams = searchParams.get("priority");
    const categoryParams = searchParams.get("category");
    const searchParamsValue = searchParams.get("search");
    const pageParams = parseInt(searchParams.get("page") || "1");
    const limitParams = parseInt(searchParams.get("limit") || "20");

    const { category, limit, page, priority, status, search } =
      validateGetRouteParams(SupportSchema, {
        status: statusParams ?? "",
        priority: priorityParams ?? "",
        category: categoryParams ?? "",
        search: searchParamsValue ?? "",
        page: pageParams,
        limit: limitParams,
      });

    await connectMongoDB();

    // 2. Build Query Filters
    let query: any = {};

    if (status && status !== "ALL") query.status = status;

    if (priority && priority !== "ALL") query.priority = priority;

    if (category && category !== "ALL") query.category = category;

    // Optional: Search by Ticket ID

    if (search) {
      query.ticketId = { $regex: search, $options: "i" };
    }

    // 3. Pagination
    // Admins usually need more rows

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
