import { NextResponse } from "next/server";
import { testRollbar } from "@omenai/shared-services/test/test";
export async function GET() {
  await testRollbar();
  return NextResponse.json({
    message: "Successful",
  });
}
