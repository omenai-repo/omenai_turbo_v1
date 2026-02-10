import { google } from "@ai-sdk/google";
import { streamText } from "ai";
import { getOmenaiContext } from "../knowledgeBase";
import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "@omenai/upstash-config";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "86400 s"),
  analytics: true,
  prefix: "@upstash/ratelimit",
});

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";

  const { success, limit, reset, remaining } = await ratelimit.limit(ip);

  // If rate limit exceeded, block the request immediately
  if (!success) {
    return new Response(
      "It looks like you’ve hit your chat limit for today. You can continue this conversation tomorrow, or open a support ticket if you need help right now.",
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": limit.toString(),
          "X-RateLimit-Remaining": remaining.toString(),
          "X-RateLimit-Reset": reset.toString(),
        },
      },
    );
  }

  // 2. Extract Data
  const { messages, pageContext } = await req.json();

  // 3. Context Injection
  const systemContext = await getOmenaiContext(pageContext || "general");

  // 4. Memory Optimization (Only keep last 6 messages to save tokens)
  const recentMessages = messages.slice(-6);

  // 5. Generate Response
  const result = streamText({
    model: google("gemini-2.5-flash"),
    system: systemContext,
    messages: recentMessages,
    temperature: 1,
  });

  return result.toTextStreamResponse();
}
