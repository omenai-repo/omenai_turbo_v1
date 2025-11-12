import { sendBuyerShipmentEmail } from "@omenai/shared-emails/src/models/shipment/sendBuyerShipmentEmail";
import { NextResponse } from "next/server";
import { sendArtistShippmentSuccessfulMail } from "../../../../../shared/shared-emails/src/models/artist/sendArtistShippmentSuccessfulMail";
import { sendGalleryShipmentSuccessfulMail } from "../../../../../shared/shared-emails/src/models/gallery/sendGalleryShipmentSuccessfulMail";
import { sendArtistBlockedMail } from "@omenai/shared-emails/src/models/artist/sendArtistBlockedMail";
export async function GET() {
  const promise = await sendArtistBlockedMail({
    name: "Test User",
    email: "rodolphe@omenai.net",
  });

  return NextResponse.json({
    message: "Successful",
  });
}
