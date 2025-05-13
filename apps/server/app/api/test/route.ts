import { NextResponse } from "next/server";
import { sendTestMail } from "./../../../../../shared/shared-emails/src/models/test/sendTestMail";
import { withAppRouterHighlight } from "@omenai/shared-lib/highlight/app_router_highlight";
export const GET = withAppRouterHighlight(async function GET(request: Request) {
  const data = await sendTestMail({
    name: "Moses",
    email: "dantereus1@gmail.com",
  });

  return NextResponse.json({ message: "Successful", data });
});
