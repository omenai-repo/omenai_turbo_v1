import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { NextRequest, NextResponse } from "next/server";
import WaitlistLead from "@omenai/shared-models/models/WaitlistFunnel/WaitlistLeadModel";
import { withRateLimit } from "@omenai/shared-lib/auth/middleware/rate_limit_middleware";
import { standardRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { rollbarServerInstance } from "@omenai/rollbar-config";
import { UAParser } from "ua-parser-js";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";

export const POST = withRateLimit(standardRateLimit)(async function POST(
  req: Request,
) {
  try {
    await connectMongoDB();

    // 1. Parse Data
    const body = await req.json();
    const { email, name, country, entity, kpi, marketing } = body;

    // 2. Validation (Basic)
    if (!email || !name || !entity) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const existingUser = await WaitlistLead.findOne({ email, entity }).lean();

    if (existingUser) {
      return NextResponse.json(
        { message: "You are already on the list!" },
        { status: 200 },
      );
    }

    const userAgentString = req.headers.get("user-agent") || "";
    const parser = new UAParser(userAgentString);
    const result = parser.getResult();

    await WaitlistLead.create({
      email,
      name,
      country,
      entity,
      kpi,
      marketing,
      device: {
        type: result.device.type || "desktop",
        vendor: result.device.vendor || "unknown",
        model: result.device.model || "unknown",
      },
      os: {
        name: result.os.name || "unknown",
        version: result.os.version || "unknown",
      },
      browser: {
        name: result.browser.name || "unknown",
      },
    });

    return NextResponse.json(
      { success: true, message: "Welcome to the club!" },
      { status: 201 },
    );
  } catch (error: any) {
    const error_response = handleErrorEdgeCases(error);
    console.error("Waitlist Error:", error);
    rollbarServerInstance.error("Waitlist Lead Error", error);
    return NextResponse.json(
      { message: error_response.message },
      { status: error_response.status },
    );
  }
});
