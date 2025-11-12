import { sendBuyerShipmentEmail } from "@omenai/shared-emails/src/models/shipment/sendBuyerShipmentEmail";
import { NextResponse } from "next/server";
import { sendArtistShippmentSuccessfulMail } from "../../../../../shared/shared-emails/src/models/artist/sendArtistShippmentSuccessfulMail";
import { sendGalleryShipmentSuccessfulMail } from "../../../../../shared/shared-emails/src/models/gallery/sendGalleryShipmentSuccessfulMail";
import { sendGalleryBlockedEmail } from "@omenai/shared-emails/src/models/gallery/sendGalleryBlockedEmail";
export async function GET() {
  const promise = await sendGalleryBlockedEmail({
    name: "Test User",
    email: "rodolphe@omenai.net",
  });

  return NextResponse.json({
    message: "Successful",
  });
}
