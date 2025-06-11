import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { IndividualSchemaTypes } from "@omenai/shared-types";
import bcrypt from "bcrypt";
import { NextResponse, NextResponse as res } from "next/server";
import {
  RateLimitExceededError,
  ConflictError,
} from "../../../../../custom/errors/dictionary/errorDictionary";
import { handleErrorEdgeCases } from "../../../../../custom/errors/handler/errorHandler";
import { AccountIndividual } from "@omenai/shared-models/models/auth/IndividualSchema";
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

      const user = await AccountIndividual.findOne<IndividualSchemaTypes>({
        email,
      }).exec();

      if (!user) throw new ConflictError("Invalid credentials");

      const isPasswordMatch = bcrypt.compareSync(password, user.password);

      if (!isPasswordMatch) throw new ConflictError("Invalid credentials");
      const { user_id, verified, name, preferences, role, address, phone } =
        user;

      const session_payload = {
        user_id,
        verified,
        name,
        preferences,
        address,
        role,
        email: user.email,
        phone,
      };

      await createSession(session_payload);

      return res.json(
        {
          message: "Login successfull",
          data: session_payload,
        },
        { status: 200 }
      );
    } catch (error: any) {
      const error_response = handleErrorEdgeCases(error);

      return NextResponse.json(
        { message: error_response?.message },
        { status: error_response?.status }
      );
    }
  }
);
