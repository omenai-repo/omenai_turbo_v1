import { withRateLimit } from "@omenai/shared-lib/auth/middleware/rate_limit_middleware";
import { NextResponse } from "next/server";
import { decryptLinkData } from "@omenai/shared-utils/src/deeplinkCrypto";
import { strictRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";

export const POST = withRateLimit(strictRateLimit)(async function POST(
  request: Request,
) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { success: false, error: "INVALID_TOKEN" },
        { status: 400 },
      );
    }

    const decryptedData = decryptLinkData(token);

    if (!decryptedData) {
      return NextResponse.json(
        { success: false, error: "INVALID_TOKEN" },
        { status: 403 },
      );
    }

    // Return the safe, structured data contract
    return NextResponse.json({
      success: true,
      data: decryptedData,
    });
  } catch (error) {
    console.error("Decryption API Error:", error);
    return NextResponse.json(
      { success: false, error: "SERVER_ERROR" },
      { status: 500 },
    );
  }
});
