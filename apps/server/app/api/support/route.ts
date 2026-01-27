import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { NextResponse } from "next/server";
import { getSessionData } from "../util";
import {
  ClientSessionData,
  CombinedConfig,
  SessionData,
} from "@omenai/shared-types";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import SupportTicket from "@omenai/shared-models/models/support/SupportTicketSchema";
import { handleErrorEdgeCases } from "../../../custom/errors/handler/errorHandler";
import { strictRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";

const config: CombinedConfig = {
  ...strictRateLimit,
  allowedRoles: ["artist", "gallery", "user"],
};
const generateTicketId = () =>
  `OM_TICKET_${Math.floor(100000 + Math.random() * 900000)}`;

export const POST = withRateLimitHighlightAndCsrf(config)(async function POST(
  req: Request,
  _: any,
  sessionData?: SessionData & { csrfToken: string },
) {
  try {
    const body = await req.json();
    const {
      category,
      referenceId,
      message,
      pageUrl,
      userEmail: bodyEmail,
      meta = {},
    } = body;

    // 1. Validation
    if (!category || !message) {
      return NextResponse.json(
        { error: "Missing required fields: category and message." },
        { status: 400 },
      );
    }

    // 2. Identity Logic (Same as before)
    let finalUserId = null;
    let finalUserEmail = bodyEmail;
    let finalUserType = "GUEST";

    if (sessionData && sessionData.userData) {
      finalUserId = sessionData.userData.id;
      finalUserEmail = sessionData.userData.email;
      finalUserType = sessionData.userData.role.toUpperCase();
    }
    // 3. Generate Ticket ID
    const ticketId = generateTicketId();

    // 4. Create Ticket with Meta
    const ticketData = {
      ticketId,
      category,
      referenceId: referenceId || null,
      message,
      pageUrl,

      meta: {
        ...meta,
        browser: req.headers.get("user-agent") || "Unknown",
      },

      userId: finalUserId,
      userEmail: finalUserEmail,
      userType: finalUserType,

      status: "OPEN",
      priority: ["PAYMENT", "PAYOUT", "WALLET", "UPLOAD_ISSUE"].includes(
        category,
      )
        ? "HIGH"
        : "NORMAL",
      createdAt: new Date(),
    };

    await connectMongoDB();
    await SupportTicket.create(ticketData);

    return NextResponse.json({
      success: true,
      message: "Ticket created",
      ticketId,
    });
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);
    console.error(" [API Error] Failed to create ticket:", error);
    return NextResponse.json(
      { message: error_response.message },
      { status: error_response.status },
    );
  }
});
