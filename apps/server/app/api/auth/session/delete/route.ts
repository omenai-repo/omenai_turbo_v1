import { deleteSession } from "@omenai/shared-auth/lib/auth/session";
import { withAppRouterHighlight } from "@omenai/shared-lib/highlight/app_router_highlight";
import { NextResponse } from "next/server";

export const POST = withAppRouterHighlight(async function POST(
  request: Request,
  context: { params: Promise<Record<string, string>> }
): Promise<Response> {
  try {
    await deleteSession();
    return NextResponse.json({ message: "Successful" }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "An error occurred while deleting the session." },
      { status: 500 }
    );
  }
});
