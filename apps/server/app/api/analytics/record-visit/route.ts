import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { withRateLimit } from "@omenai/shared-lib/auth/middleware/rate_limit_middleware";
import { standardRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import CampaignVisit from "@omenai/shared-models/models/WaitlistFunnel/CampaignVisitsModel";
import { UAParser } from "ua-parser-js";
export const POST = withRateLimit(standardRateLimit)(async function POST(
  req: Request,
) {
  try {
    // 1. Connect to the Database
    await connectMongoDB();

    let body;
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      body = await req.json();
    } else {
      // Handle Beacon plain text payload
      const text = await req.text();
      body = JSON.parse(text);
    }

    const { source, medium, campaign, referrer, visitorId } = body;

    // 3. 🕵️‍♂️ Detective Work: Detect Country
    // Vercel and Cloudflare pass the country code in headers automatically
    const country =
      req.headers.get("x-vercel-ip-country") ||
      req.headers.get("cf-ipcountry") ||
      "unknown";

    const userAgentString = req.headers.get("user-agent") || "";
    const parser = new UAParser(userAgentString);
    const result = parser.getResult();

    let finalDeviceType = result.device.type;
    let deviceType;

    if (!finalDeviceType) {
      // If it's empty, but the OS is Windows/Mac, it's a desktop
      if (["Windows", "Mac OS", "Linux"].includes(result.os.name || "")) {
        deviceType = `desktop - ${result.os.name}`;
      } else {
        deviceType = "unknown";
      }
    }

    // 4. Record the Visit
    // We use 'create' to insert a new row for every visit
    await CampaignVisit.create({
      visitorId, // The UUID from your frontend
      source: source || "direct",
      medium: medium || "none",
      campaign: campaign || "none",
      referrer: referrer || "",
      country,
      device: {
        type: deviceType, // 👈 Use our smarter variable
        vendor: result.device.vendor || "Generic", // Desktops often don't have a "Vendor"
        model: result.device.model || "PC",
      },
      os: {
        name: result.os.name || "unknown",
        version: result.os.version || "unknown",
      },
      browser: {
        name: result.browser.name || "unknown",
      },
    });

    // 5. Respond Success
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Analytics Error:", error);
    // Even if it fails, we don't want to break the user's experience
    // so we return 200 or 500 silently.
    return NextResponse.json({ success: false }, { status: 500 });
  }
});
