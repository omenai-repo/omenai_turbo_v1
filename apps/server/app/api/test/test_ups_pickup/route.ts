import { NextResponse } from "next/server";
import {
  ShipmentRequestDataTypes,
  ShipmentDimensions,
} from "@omenai/shared-types";
import { scheduleUPSPickup } from "../../ups_service";

// 1. MOCK DATA (Must be a valid US Address)
// Use a real address or UPS might reject the "ResidentialIndicator" check
const MOCK_PICKUP_DATA: ShipmentRequestDataTypes = {
  // Only the fields used by scheduleUPSPickup are needed here
  seller_details: {
    fullname: "Omenai Test Pickup",
    email: "test@omenai.com",
    phone: "2125551234",
    address: {
      address_line: "450 W 33rd St", // Hudson Yards (Commercial/Mixed)
      city: "New York",
      stateCode: "NY",
      zip: "10001",
      countryCode: "US",
      country: "United States",
      state: "New York",
    },
  },
  originCountryCode: "US",
  shipment_product_code: "03", // UPS Ground
  carrier: "UPS",
  // These fields are ignored by pickup but required by TS type
  artwork_name: "Ignored",
  invoice_number: "Ignored",
  artwork_price: 0,
  receiver_data: {} as any,
  receiver_address: {} as any,
  specialInstructions: "",
  dimensions: {} as any,
};

const MOCK_DIMENSIONS: ShipmentDimensions = {
  weight: 5, // kg -> ~11lbs
  length: 10,
  width: 10,
  height: 10,
};

export async function GET(req: Request) {
  try {
    console.log(" Starting UPS Pickup Test...");

    // 2. Call the Service
    // This calculates the next valid business day automatically
    const result = await scheduleUPSPickup(MOCK_PICKUP_DATA, MOCK_DIMENSIONS);

    // 3. Return Result
    return NextResponse.json({
      success: true,
      message: "Pickup Scheduled Successfully",
      data: {
        pickup_request_number: result.PickupCreationResponse.PRN,
        rate_status: result.PickupCreationResponse.RateStatus,
        // Detailed info returned by UPS
        full_response: result,
      },
      warning:
        "IF RUNNING IN PROD: Call UPS to cancel PRN " +
        result.PickupCreationResponse.PRN,
    });
  } catch (error: any) {
    console.error("❌ UPS Pickup Test Failed:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Unknown Error",
        // UPS often hides the real error in a nested 'response' object
        details: error.response?.data || "Check server logs for raw error",
      },
      { status: 500 },
    );
  }
}
