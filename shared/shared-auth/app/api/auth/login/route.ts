import { NextResponse } from "next/server";
import { createSession } from "../../../../lib/auth/session";

export async function POST() {
  try {
    await createSession("Moses Ikekhua");
    return NextResponse.json({ message: "Successful" }, { status: 200 });
  } catch (error) {
    console.log(error);
  }
}
