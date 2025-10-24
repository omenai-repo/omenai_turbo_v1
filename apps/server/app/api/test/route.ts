import { NextResponse } from "next/server";
import { sendArtistShippmentSuccessfulMail } from "../../../../../shared/shared-emails/src/models/artist/sendArtistShippmentSuccessfulMail";
import { sendGalleryShipmentSuccessfulMail } from "../../../../../shared/shared-emails/src/models/gallery/sendGalleryShipmentSuccessfulMail";
export async function GET() {
  const response = await sendGalleryShipmentSuccessfulMail({
    name: "Rodolphe",
    email: "rodolphe@omenai.net",
    dashboardUrl: "app.omenai.net",
  });
  console.log(response);
  return NextResponse.json({
    message: "Successful",
  });
}
