import { google } from "@ai-sdk/google";
import { streamText } from "ai";
import { getOmenaiContext } from "../knowledgeBase";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, pageContext } = await req.json();

  const systemContext = await getOmenaiContext(pageContext || "general");

  const recentMessages = messages.slice(-6);

  const result = streamText({
    model: google("gemini-3-flash-preview"),

    system: systemContext,
    messages: recentMessages, // <--- Sending lighter payload
    temperature: 0.7,
  });

  return result.toTextStreamResponse();
}
