import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { AccountAdminSchemaTypes } from "@omenai/shared-types";
import bcrypt from "bcrypt";
import { AccountAdmin } from "@omenai/shared-models/models/auth/AccountAdmin";
import { NextResponse, NextResponse as res } from "next/server";
import {
  RateLimitExceededError,
  ConflictError,
} from "../../../../../custom/errors/dictionary/errorDictionary";
import { handleErrorEdgeCases } from "../../../../../custom/errors/handler/errorHandler";
import { getIp } from "@omenai/shared-lib/auth/getIp";
import { limiter } from "@omenai/shared-lib/auth/limiter";
import { createSession } from "@omenai/shared-auth/lib/auth/session";
export async function POST(request: Request) {
  try {
    const data = await request.json();

    const { email, password } = data;

    // const ip = await getIp();

    // const { success } = await limiter.limit(ip);

    // if (!success)
    //   throw new RateLimitExceededError("Too many requests, try again later.");

    await connectMongoDB();

    const user = await AccountAdmin.findOne<AccountAdminSchemaTypes>({
      email,
    }).exec();

    if (!user) throw new ConflictError("Invalid credentials");

    const isPasswordMatch = bcrypt.compareSync(password, user.password);

    if (!isPasswordMatch) throw new ConflictError("Invalid credentials");
    const session_paload = {
      name: user.name,
      email: user.email,
      admin_id: user.admin_id,
      role: user.role,
    };

    await createSession(session_paload);

    return res.json(
      {
        message: "Login successful",
      },
      { status: 200 }
    );
  } catch (error: any) {
    const error_response = handleErrorEdgeCases(error);
    console.log(error);

    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status }
    );
  }
}
