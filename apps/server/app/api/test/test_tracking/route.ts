import { NextResponse } from "next/server";
import { getDHLTracking } from "../../dhl_service";
import { getUPSTracking } from "../../ups_service";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const carrier = searchParams.get("carrier")?.toUpperCase();
  const trackingNumber = searchParams.get("tracking_number");

  if (!carrier || !trackingNumber) {
    return NextResponse.json(
      {
        success: false,
        error: "Missing 'carrier' or 'tracking_number' params",
      },
      { status: 400 },
    );
  }

  try {
    let result;
    console.log(`🔍 Testing ${carrier} tracking for: ${trackingNumber}`);

    if (carrier === "DHL") {
      result = await getDHLTracking(trackingNumber);
    } else if (carrier === "UPS") {
      result = await getUPSTracking(trackingNumber);
    } else {
      return NextResponse.json({ error: "Invalid Carrier" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      carrier: carrier,
      data: result,
    });
  } catch (error: any) {
    console.error("❌ Tracking Test Failed:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
