import { getUploadLimitLookup } from "@omenai/shared-utils/src/uploadLimitUtility";
import { NextResponse } from "next/server";

export async function GET() {
  const type = "Basic";
  const interval = "yearly";
  const limit = getUploadLimitLookup(type, interval);
  return NextResponse.json({ message: "Test route is working!", limit });
}
