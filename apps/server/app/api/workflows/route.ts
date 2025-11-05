import { serve } from "@upstash/workflow/nextjs";
import { NextResponse } from "next/server";

// Map the payload of the expected data here
type Payload = {
  sample: string;
};
export const { POST } = serve<Payload[]>(async (ctx) => {
  // Retrieve the payload here for use within your runs
  const payload: Payload[] = ctx.requestPayload;

  // Implement your workflow logic within ctx.run
  ctx.run("create_new_tes", async () => {});

  return NextResponse.json({ data: "Successful" }, { status: 201 });
});
