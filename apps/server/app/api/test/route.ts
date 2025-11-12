import { sendBuyerShipmentEmail } from "@omenai/shared-emails/src/models/shipment/sendBuyerShipmentEmail";
import { NextResponse } from "next/server";
import { sendArtistShippmentSuccessfulMail } from "../../../../../shared/shared-emails/src/models/artist/sendArtistShippmentSuccessfulMail";
import { sendGalleryShipmentSuccessfulMail } from "../../../../../shared/shared-emails/src/models/gallery/sendGalleryShipmentSuccessfulMail";
export async function GET() {
  const promise = await sendGalleryShipmentSuccessfulMail({
    name: "Test User",
    email: "rodolphe@omenai.net",
  });

  return NextResponse.json({
    message: "Successful",
  });
}
