import { NextResponse } from "next/server";

export async function GET() {
<<<<<<< HEAD
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
=======
  return NextResponse.json({});
>>>>>>> a2cfb759a87a54f31c4d3da45a23a28dadeb8733
}
