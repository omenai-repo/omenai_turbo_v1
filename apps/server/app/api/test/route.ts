import { sendBuyerShipmentEmail } from "@omenai/shared-emails/src/models/shipment/sendBuyerShipmentEmail";
import { NextResponse } from "next/server";
import { sendArtistShippmentSuccessfulMail } from "../../../../../shared/shared-emails/src/models/artist/sendArtistShippmentSuccessfulMail";
import { sendGalleryShipmentSuccessfulMail } from "../../../../../shared/shared-emails/src/models/gallery/sendGalleryShipmentSuccessfulMail";
export async function GET() {
  const promise = await sendBuyerShipmentEmail({
    name: "Test User",
    email: "moses@omenai.net",
    trackingCode: "TEST123456",
  });

  return NextResponse.json({
    message: "Successful",
  });
}
