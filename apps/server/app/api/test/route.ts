import { NextResponse } from "next/server";
import { sendOrderRequestReminder } from "@omenai/shared-emails/src/models/orders/sendOrderRequestReminder";
import { sendOrderRequestReceivedMail } from "@omenai/shared-emails/src/models/orders/orderRequestReceived";
import { sendOrderRequestToGalleryMail } from "@omenai/shared-emails/src/models/orders/orderRequestToGallery";
import { sendPriceEmail } from "@omenai/shared-emails/src/models/orders/requestPriceEmail";
const payload = {
  email: "dantereus1@gmail.com",
  name: "Collector",
  artwork_data: {
    title: "Echoes of the Delta",
    artist: "Bruce Onobrakpeya",
    art_id: "art_2298",
    medium: "Photography" as const,
    pricing: {
      usd_price: 12500,
      price: 12500,
      currency: "USD",
      shouldShowPrice: "Yes",
    },
    url: "699250ec002f16dee208",
  },
};
export async function GET() {
  await sendPriceEmail(payload);
  return NextResponse.json({ message: "Test route is working!" });
}
