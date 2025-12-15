import { NextResponse } from "next/server";
import { render } from "@react-email/render";
import SubscriptionExpireAlert from "@omenai/shared-emails/src/views/subscription/SubscriptionExpireAlert";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);
export async function GET() {
  const html = await render(SubscriptionExpireAlert("Test user", `in 3 days`));
  const { data, error } = await resend.emails.send({
    from: "Onboarding <onboarding@omenai.app>",
    to: "moses@omenai.net",
    subject: "Your subscription expires in 3 days",
    html,
  });
  return NextResponse.json({
    message: "Successful",
    data,
    error,
  });
}
