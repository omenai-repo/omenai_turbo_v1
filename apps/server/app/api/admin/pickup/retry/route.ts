import { NextResponse } from "next/server";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { FailedPickup } from "@omenai/shared-models/models/crons/FailedPickup";
import { scheduleUPSPickup } from "../../../ups_service";
import { createErrorRollbarReport, validateRequestBody } from "../../../util";
import { withRateLimit } from "@omenai/shared-lib/auth/middleware/rate_limit_middleware";
import { strictRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { CombinedConfig } from "@omenai/shared-types";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import z from "../../../../../node_modules/zod/v4/classic/external.cjs";
import { GetSingleOrderSchema } from "../../../orders/getSingleOrder/route";
const config: CombinedConfig = {
  ...strictRateLimit,
  allowedRoles: ["admin"],
  allowedAdminAccessRoles: ["Admin", "Owner"],
};

const PickupRetrySchema = z.object({
  order_id: z.string().min(1),
});
export const POST = withRateLimitHighlightAndCsrf(config)(async function POST(
  req: Request,
) {
  const { order_id } = await validateRequestBody(req, PickupRetrySchema);

  try {
    await connectMongoDB();

    if (!order_id) {
      return NextResponse.json(
        { message: "Order ID is required" },
        { status: 400 },
      );
    }

    // 2. Fetch the Failed Record
    const failedRecord = await FailedPickup.findOne({ order_id });

    if (!failedRecord) {
      return NextResponse.json(
        { message: "No failed pickup record found for this order." },
        { status: 404 },
      );
    }

    if (failedRecord.status === "resolved") {
      return NextResponse.json(
        { message: "This pickup has already been resolved." },
        { status: 400 },
      );
    }

    // 3. Extract Snapshot Data
    // We stored { data, dimensions } in the snapshot
    const { data, dimensions } = failedRecord.payload_snapshot;

    if (!data || !dimensions) {
      throw new Error("Corrupted snapshot data. Cannot retry.");
    }

    // 4. Attempt Retry
    // We call the isolated schedule function directly
    await scheduleUPSPickup(data, dimensions);

    // 5. Success Handler
    // Option A: Delete the record (cleaner DB)
    // await FailedPickup.deleteOne({ _id: failedRecord._id });

    // Option B: Mark resolved (better audit trail) - RECOMMENDED
    failedRecord.status = "resolved";
    failedRecord.error_message = "Resolved manually via Admin Dashboard";
    await failedRecord.save();

    return NextResponse.json({
      message: "Pickup scheduled successfully.",
      success: true,
    });
  } catch (error: any) {
    // 6. Failure Handler (Update Record)
    const errorMsg = error.message || JSON.stringify(error);

    // We re-fetch to ensure we don't have version conflicts, or just update the doc we have
    await FailedPickup.updateOne(
      { order_id: req.json().then((b: any) => b.order_id) }, // careful with promise here, better to use variable
      {
        $inc: { retry_count: 1 },
        $set: {
          error_message: errorMsg,
          status: "manual_intervention_required", // Escalated status
        },
      },
    );

    createErrorRollbarReport("Admin Pickup Retry Failed", error, 500);

    return NextResponse.json(
      {
        message: "Retry failed. UPS returned an error.",
        error: errorMsg,
      },
      { status: 500 },
    );
  }
});
