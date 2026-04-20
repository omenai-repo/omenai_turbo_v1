import { GalleryEventValidationSchema } from "@omenai/shared-lib/zodSchemas/GalleryEventValidationSchema";
import { NextResponse } from "next/server";
import { createGalleryEvent } from "../../../../services/gallery/events/createGalleryEvent.service";
import { CombinedConfig } from "@omenai/shared-types";
import { standardRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";

const config: CombinedConfig = {
  ...standardRateLimit,
  allowedRoles: ["gallery"],
};

export const POST = withRateLimitHighlightAndCsrf(config)(async function POST(
  req: Request,
) {
  try {
    const body = await req.json();

    // 2. Validate the payload using Zod
    const validatedData = GalleryEventValidationSchema.parse(body);

    await connectMongoDB();
    // 3. Pass to the service layer
    const result = await createGalleryEvent(validatedData);

    if (!result.isOk) {
      return NextResponse.json(
        { isOk: false, message: result.message },
        { status: 400 },
      );
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error("API Error - Create Programming:", error);

    // Handle Zod validation errors gracefully
    if (error.name === "ZodError") {
      return NextResponse.json(
        {
          isOk: false,
          message: "Invalid event data provided.",
          errors: error.errors,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { isOk: false, message: "Internal server error" },
      { status: 500 },
    );
  }
});
