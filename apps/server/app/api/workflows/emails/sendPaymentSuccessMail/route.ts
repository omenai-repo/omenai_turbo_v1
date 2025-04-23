import { sendPaymentSuccessMail } from "@omenai/shared-emails/src/models/payment/sendPaymentSuccessMail";
import { sendPaymentSuccessMailArtist } from "@omenai/shared-emails/src/models/payment/sendPaymentSuccessMailArtist";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { formatIntlDateTime } from "@omenai/shared-utils/src/formatIntlDateTime";
import { serve } from "@upstash/workflow/nextjs";
import { NextResponse } from "next/server";

type Payload = {
  buyer_email: string;
  buyer_name: string;
  artwork_title: string;
  order_id: string;
  order_date: string;
  transaction_id: string;
  price: string;
  seller_email: string;
  seller_name: string;
};
export const { POST } = serve<Payload>(async (ctx) => {
  const payload: Payload = ctx.requestPayload;
  await connectMongoDB();
  const [sendSuccessBuyerMail, sendSellerSuccessMail] = await Promise.all([
    ctx.run("send_mail_to_buyer", async () => {
      const data: { error: boolean; message: string } =
        await sendPaymentSuccessMail({
          email: payload.buyer_email,
          name: payload.buyer_name,
          artwork: payload.artwork_title,
          order_id: payload.order_id,
          order_date: formatIntlDateTime(payload.order_date),
          transactionId: payload.transaction_id,
          price: payload.price,
        });

      return data.error;
    }),
    ctx.run("send_mail_to_seller", async () => {
      const data: { error: boolean; message: string } =
        await sendPaymentSuccessMailArtist({
          email: payload.seller_email,
          name: payload.seller_name,
          artwork: payload.artwork_title,
          order_date: formatIntlDateTime(payload.order_date),
          transactionId: payload.transaction_id,
          price: payload.price,
        });

      return data.error;
    }),
  ]);
  if (sendSuccessBuyerMail || sendSellerSuccessMail) {
    return NextResponse.json(
      { message: "Error sending email" },
      { status: 500 }
    );
  }
  return NextResponse.json({ data: "Successful" }, { status: 201 });
});
