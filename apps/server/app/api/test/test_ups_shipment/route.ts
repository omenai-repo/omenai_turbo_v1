import { NextResponse } from "next/server";
import { ShipmentRequestDataTypes } from "@omenai/shared-types";
import { createUPSShipment } from "../../ups_service";

export const MOCK_SHIPMENT_DATA: ShipmentRequestDataTypes = {
  // Metadata
  artwork_name: "Test Abstract Painting",
  invoice_number: `TEST-INV-${Date.now()}`, // Unique ID to avoid dupe errors
  artwork_price: 500,
  specialInstructions: "Handle with care",

  // Seller (Origin / Pickup Location)
  seller_details: {
    fullname: "Omenai Gallery Test",
    email: "gallery@test.com",
    phone: "2125551234",
    address: {
      address_line: "450 W 33rd St",
      city: "Chicago",
      stateCode: "IL",
      zip: "60601",
      countryCode: "US",
      country: "United States",
      state: "Illinois",
    },
  },

  // Buyer (Destination)
  receiver_data: {
    fullname: "John Collector",
    email: "buyer@test.com",
    phone: "4155559876",
  },
  receiver_address: {
    address_line: "1 Dr Carlton B Goodlett Pl", // SF City Hall
    city: "San Francisco",
    stateCode: "CA",
    zip: "94102",
    countryCode: "US",
    country: "United States",
    state: "New York",
  },

  // Logistics
  shipment_product_code: "03", // UPS Ground
  carrier: "UPS",
  dimensions: {
    weight: 5, // kg
    length: 50, // cm
    width: 50,
    height: 10,
  },
  originCountryCode: "US",
};

export async function GET(req: Request) {
  try {
    console.log("🚀 Starting UPS Shipment Test...");

    // 2. Call the Service
    // This triggers: Rate check (TNT) -> Label Gen -> Pickup Schedule
    const result = await createUPSShipment(MOCK_SHIPMENT_DATA);

    // 3. Return Result
    return NextResponse.json({
      success: true,
      message: "Shipment Created & Pickup Scheduled",
      data: {
        tracking_number: result.shipmentTrackingNumber,
        estimated_delivery: result.estimatedDeliveryDate,
        label_preview: "Base64 string hidden for brevity (check length)",
        label_length: result.documents[0].content.length,
        label: result.documents[0].content, // Base64-encoded label (PDF or GIF)
      },
      // 4. Instructions for Verification
      instructions:
        "Copy the 'content' from the full response and decode Base64 to see the GIF label.",
    });
  } catch (error: any) {
    console.error("❌ UPS Shipment Test Failed:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Unknown Error",
        details: error.response?.data || "No external API details",
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    );
  }
}
