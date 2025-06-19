import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { AccountAdminSchemaTypes } from "@omenai/shared-types";
import bcrypt from "bcrypt";
import { AccountAdmin } from "@omenai/shared-models/models/auth/AccountAdmin";
import { NextResponse, NextResponse as res } from "next/server";
import { ConflictError } from "../../../../../custom/errors/dictionary/errorDictionary";
import { handleErrorEdgeCases } from "../../../../../custom/errors/handler/errorHandler";
import { strictRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitAndHighlight } from "@omenai/shared-lib/auth/middleware/combined_middleware";
export const POST = withRateLimitAndHighlight(strictRateLimit)(
  async function POST(request: Request) {
    try {
      const data = await request.json();

      const { email, password } = data;

      await connectMongoDB();

      const user = await AccountAdmin.findOne<AccountAdminSchemaTypes>({
        email,
      }).exec();

      if (!user) throw new ConflictError("Invalid credentials");

      const isPasswordMatch = bcrypt.compareSync(password, user.password);

      if (!isPasswordMatch) throw new ConflictError("Invalid credentials");
      const session_payload = {
        name: user.name,
        email: user.email,
        id: user.admin_id,
        role: user.role,
        admin_id: user.admin_id,
      };

      return res.json(
        {
          message: "Login successful",
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
