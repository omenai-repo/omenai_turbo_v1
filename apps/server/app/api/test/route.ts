import { NextResponse } from "next/server";

export async function GET() {
  await SendArtistShipmentSuccessEmail({
    email: "rodolphe@omenai.net",
    name: "Samwell Tarly",
    trackingCode: "1223445",
    artworkImage: "69826eb2000756464742",
    artwork: "Comfort zone",
    artistName: "Nana Bruce",
    price: formatPrice("4414"),
  });
  return NextResponse.json({
    message: "Successful",
  });
}
