import { standardRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { CombinedConfig } from "@omenai/shared-types";
import { NextResponse } from "next/server";
import z from "zod";
import {
  addArtworksToEvent,
  removeArtworkFromEvent,
} from "../../../../services/gallery/events/updateEventArtwork.service";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
const config: CombinedConfig = {
  ...standardRateLimit,
  allowedRoles: ["gallery"],
};

const validateUpdateSchema = z.object({
  event_id: z.string(),
  artwork_id: z.array(z.string()).or(z.string()),
  gallery_id: z.string(),
  type: z.enum(["remove", "add"]),
});
export const PATCH = withRateLimitHighlightAndCsrf(config)(async function PATCH(
  req: Request,
) {
  try {
    const body = await req.json();
    const { event_id, artwork_id, gallery_id, type } =
      validateUpdateSchema.parse(body);

    let result = { isOk: false, message: "Invalid operation type" };
    await connectMongoDB();
    if (type === "remove") {
      // Call the service to remove artwork from event and unlock mutex
      const data = await removeArtworkFromEvent(
        event_id,
        artwork_id as string,
        gallery_id,
      );
      result = data;
    } else if (type === "add") {
      // Call the service to add artwork to event and lock mutex
      const data = await addArtworksToEvent(
        event_id,
        artwork_id as string[],
        gallery_id,
      );
      result = data;
    }
    return NextResponse.json(result, { status: result.isOk ? 200 : 400 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { isOk: false, message: "Internal server error" },
      { status: 500 },
    );
  }
});
