import { NextResponse } from "next/server";
import { sendPriceReviewRequest } from "@omenai/shared-emails/src/models/artist/sendPriceReviewRequest";
import { sendPriceReviewCompleted } from "@omenai/shared-emails/src/models/artist/sendPriceReviewCompleted";
import { sendPriceReviewApproved } from "@omenai/shared-emails/src/models/artist/sendPriceReviewApproved";
import { sendArtworkPriceReviewEmail } from "@omenai/shared-emails/src/models/admin/sendArtworkPriceReviewEmail";

const payload = {
  email: "dantereus1@gmail.com",
  name: "Elias",
  artwork: "Symphony of the Sahara",
  artistName: "Amina Bello",
  artworkImage: "699250ec002f16dee208",
  price: "$8,500.00",
  transaction_id: "pi_3MtwBwLkdIwHu7ix28a3",
  order_date: "February 24, 2026",
  order_id: "882194-ACQ",
};
const email = "moses@omenai.net";

export async function GET() {
  // await sendPriceReviewRequest({ name: "Oberyn Martell", email });
  // await sendPriceReviewApproved({ name: "Oberyn Martell", email });
  // await sendPriceReviewCompleted({ name: "Oberyn Martell", email });
  // await sendArtworkPriceReviewEmail({ name: "Oberyn Martell", email });

  // const data = await getFutureShipmentDate(3, true, "US");
  return NextResponse.json({ message: "Test route is working!" });
}
