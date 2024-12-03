import { createSession } from "@omenai/shared-auth/lib/auth/session";
import { NextResponse } from "next/server";

export async function POST() {
  const payload = {
    id: 1,
    user_id: "dvsvjsvnvnjsvkjsv",
    verified: true,
    email: "dantereus1@gmail.com",
    name: "Moses Chukwunekwu",
    preferences: ["data_preferences"],
    role: "user",
  };
  try {
    await createSession(payload);
    return NextResponse.json({ message: "Successful" }, { status: 200 });
  } catch (error) {
    console.log(error);
  }
}
