import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { AccountGallery } from "@omenai/shared-models/models/auth/GallerySchema";
import { GallerySchemaTypes } from "@omenai/shared-types";
import bcrypt from "bcrypt";
import { NextResponse, NextResponse as res } from "next/server";
import {
  RateLimitExceededError,
  ConflictError,
} from "../../../../../custom/errors/dictionary/errorDictionary";
import { handleErrorEdgeCases } from "../../../../../custom/errors/handler/errorHandler";
import { createSession } from "@omenai/shared-auth/lib/auth/session";
import { withAppRouterHighlight } from "@omenai/shared-lib/highlight/app_router_highlight";
import { strictRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitAndHighlight } from "@omenai/shared-lib/auth/middleware/combined_middleware";

export const POST = withRateLimitAndHighlight(strictRateLimit)(
  async function POST(request: Request) {
    try {
      const data = await request.json();

      const { email, password } = data;

      await connectMongoDB();

      const user = await AccountGallery.findOne<GallerySchemaTypes>({
        email,
      }).exec();

      if (!user) throw new ConflictError("Invalid credentials");

      const isPasswordMatch = bcrypt.compareSync(password, user.password);

      if (!isPasswordMatch) throw new ConflictError("Invalid credentials");
      const {
        gallery_id,
        verified,
        admin,
        description,
        address,
        gallery_verified,
        name,
        role,
        logo,
        subscription_status,
        connected_account_id,
        status,
        phone,
      } = user;
      const session_payload = {
        gallery_id,
        verified,
        admin,
        description,
        address,
        gallery_verified,
        name,
        role,
        logo,
        subscription_status,
        connected_account_id,
        email: user.email,
        status,
        phone,
      };

      await createSession(session_payload);

      return res.json(
        {
          message: "Login successful",
          data: session_payload,
        },
        { status: 200 }
      );
    } catch (error) {
      const error_response = handleErrorEdgeCases(error);
      return NextResponse.json(
        { message: error_response?.message },
        { status: error_response?.status }
      );
    }
  }
);
