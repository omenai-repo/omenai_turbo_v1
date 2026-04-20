import { standardRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { CombinedConfig } from "@omenai/shared-types";
import { NextResponse } from "next/server";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";

import {
  removeInstallationView,
  updateInstallationViews,
} from "../../../../services/gallery/events/updateInstallationViews.service";
import z from "zod";
import { removeArtworkFromEvent } from "../../../../services/gallery/events/updateEventArtwork.service";
const config: CombinedConfig = {
  ...standardRateLimit,
  allowedRoles: ["gallery"],
};

const installationViewsSchema = z.object({
  gallery_id: z.string(),
  event_id: z.string(),
  image_urls: z.array(z.string()).or(z.string()),
  type: z.enum(["add", "remove"]),
});
export const PATCH = withRateLimitHighlightAndCsrf(config)(async function PATCH(
  req: Request,
) {
  try {
    const body = await req.json();
    const { event_id, gallery_id, image_urls, type } = body;

    if (!event_id || !gallery_id || !image_urls) {
      return NextResponse.json(
        { isOk: false, message: "Missing required fields" },
        { status: 400 },
      );
    }
    await connectMongoDB();

    // 2. Execute Archive & Teardown

    let result = { isOk: false, message: "Invalid operation type" };

    if (type === "remove") {
      // Call the service to remove artwork from event and unlock mutex
      const data = await removeInstallationView(
        event_id,
        gallery_id,
        image_urls as string,
      );
      result = data;
    } else if (type === "add") {
      // Call the service to add artwork to event and lock mutex
      const data = await updateInstallationViews(
        event_id,
        gallery_id,
        image_urls,
      );
      result = data;
    }
    return NextResponse.json(result, { status: result.isOk ? 200 : 400 });
  } catch (error) {
    console.error("API Error - Archive Programming:", error);
    return NextResponse.json(
      { isOk: false, message: "Internal server error" },
      { status: 500 },
    );
  }
});
