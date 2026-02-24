import { NextResponse } from "next/server";
import { AddressTypes, ShipmentDimensions } from "@omenai/shared-types";
import { getUPSRates } from "../../ups_service";

// 1. MOCK DATA (NY Gallery -> CA Collector)
const MOCK_ORIGIN: AddressTypes = {
  address_line: "450 W 33rd St", // Hudson Yards
  city: "New York",
  stateCode: "NY",
  zip: "10001",
  countryCode: "US",
  country: "United States",
  state: "New York",
};

const MOCK_DESTINATION: AddressTypes = {
  address_line: "1 Dr Carlton B Goodlett Pl", // City Hall
  city: "San Francisco",
  stateCode: "CA",
  zip: "94102",
  countryCode: "US",
  country: "United States",
  state: "California",
};

const MOCK_DIMENSIONS: ShipmentDimensions = {
  weight: 5, // kg (Will be converted to ~11 lbs)
  length: 50, // cm
  width: 50,
  height: 10,
};

export async function GET(req: Request) {
  try {
    console.log("🚀 Starting UPS Rate Test...");

    // 2. Call the Service
    const rate = await getUPSRates(
      MOCK_ORIGIN,
      MOCK_DESTINATION,
      MOCK_DIMENSIONS,
    );

    // 3. Return Result
    return NextResponse.json({
      success: true,
      message: "UPS Rate Calculated Successfully",
      data: rate,
      // Debug info to verify conversion
      debug: {
        original_metric: MOCK_DIMENSIONS,
        converted_lbs: (MOCK_DIMENSIONS.weight * 2.20462).toFixed(2),
      },
    });
  } catch (error: any) {
    console.error("❌ UPS Rate Test Failed:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Unknown Error",
        // Stack trace helps debug auth/network issues
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    );
  }
}
