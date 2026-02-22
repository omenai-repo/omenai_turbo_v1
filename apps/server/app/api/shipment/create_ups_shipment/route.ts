import { NextResponse } from "next/server";
import { createUPSShipment } from "../../ups_service";
import { createErrorRollbarReport } from "../../util";
import { withRateLimit } from "@omenai/shared-lib/auth/middleware/rate_limit_middleware";
import { standardRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";

export const POST = withRateLimit(standardRateLimit)(async function POST(
  req: Request,
) {
  // Validate Internal Secret (same security as DHL endpoint)
  const internalSecret = req.headers.get("x-internal-secret");
  if (internalSecret !== process.env.INTERNAL_SECRET) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();

    // Call the UPS Service
    const shipmentData = await createUPSShipment(body);

    // Return exact structure expected by Workflow
    return NextResponse.json({
      message: "Shipment created successfully",
      data: shipmentData,
    });
  } catch (error: any) {
    createErrorRollbarReport("UPS Endpoint Error", error, 500);
    return NextResponse.json(
      { message: error.message || "Failed to create UPS shipment" },
      { status: 500 },
    );
  }
});
