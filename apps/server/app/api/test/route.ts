import { NextResponse } from "next/server";
import { sendTestMail } from "./../../../../../shared/shared-emails/src/models/test/sendTestMail";
import { withAppRouterHighlight } from "@omenai/shared-lib/highlight/app_router_highlight";
import { sendMemberInviteEmail } from "@omenai/shared-emails/src/models/admin/sendMemberInviteEmail";
export const GET = withAppRouterHighlight(async function GET(request: Request) {
  const data = await sendMemberInviteEmail({
    token: "Moses",
    email: "dantereus1@gmail.com",
  });

  return NextResponse.json({ message: "Successful", data });
});
