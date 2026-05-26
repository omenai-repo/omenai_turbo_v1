import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import SupportTicket from "@omenai/shared-models/models/support/SupportTicketSchema";
import { NextResponse } from "next/server";
import { handleErrorEdgeCases } from "../../../../../custom/errors/handler/errorHandler";
import { NotFoundError } from "../../../../../custom/errors/dictionary/errorDictionary";
import {
  createErrorRollbarReport,
  validateGetRouteParams,
  validateRequestBody,
} from "../../../util";
import z from "zod";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { strictRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { CombinedConfig } from "@omenai/shared-types";

const SupportPatchGetIdSchema = z.object({
  ticketId: z.string().min(1).trim(),
});
const SupportPatchSchema = z.object({
  status: z.string().min(1),
  priority: z.string(),
});

const config: CombinedConfig = {
  ...strictRateLimit,
  allowedRoles: ["admin"],
  allowedAdminAccessRoles: ["Admin", "Owner", "Principal"],
};
// PATCH: Update Status or Priority
export const PATCH = withRateLimitHighlightAndCsrf(config)(async function PATCH(
  req: Request,
) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const { ticketId } = validateGetRouteParams(SupportPatchGetIdSchema, {
      ticketId: id,
    });

    const { priority, status } = await validateRequestBody(
      req,
      SupportPatchSchema,
    );

    await connectMongoDB();

    const updatedTicket = await SupportTicket.findOneAndUpdate(
      { ticketId },
      {
        $set: {
          ...(status && { status }),
          ...(priority && { priority }),
          updatedAt: new Date(),
        },
      },
      { new: true },
    );

    if (!updatedTicket) throw new NotFoundError("Support ticket not found");

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
});
