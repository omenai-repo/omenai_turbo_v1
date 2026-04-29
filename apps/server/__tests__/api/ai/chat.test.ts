import { describe, it, expect, vi, beforeEach } from "vitest";
import { buildValidateRequestBodyMock } from "../../helpers/util-mock";

const mockRatelimitLimit = vi.hoisted(() =>
  vi.fn().mockResolvedValue({ success: true, limit: 5, reset: 9999999999, remaining: 4 }),
);

vi.mock("@upstash/ratelimit", () => ({
  Ratelimit: class {
    limit = mockRatelimitLimit;
    static slidingWindow() {
      return {};
    }
  },
}));

vi.mock("@omenai/upstash-config", () => ({
  redis: {},
}));

vi.mock("@ai-sdk/google", () => ({
  google: vi.fn().mockReturnValue("gemini-model"),
}));

const mockToTextStreamResponse = vi.hoisted(() =>
  vi.fn().mockReturnValue(new Response("stream", { status: 200 })),
);

vi.mock("ai", () => ({
  streamText: vi.fn().mockReturnValue({ toTextStreamResponse: mockToTextStreamResponse }),
}));

vi.mock("../../../app/api/ai/knowledgeBase", () => ({
  getOmenaiContext: vi.fn().mockResolvedValue("You are an AI assistant for Omenai."),
}));

vi.mock("../../../app/api/util", () => buildValidateRequestBodyMock());

import { POST } from "../../../app/api/ai/chat/route";
import { google } from "@ai-sdk/google";
import { streamText } from "ai";
import { getOmenaiContext } from "../../../app/api/ai/knowledgeBase";

function makeRequest(body: Record<string, any> = {}): Request {
  return new Request("http://localhost/api/ai/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": "1.2.3.4" },
    body: JSON.stringify(body),
  });
}

const validBody = {
  messages: [{ role: "user", content: "What is Omenai?" }],
  pageContext: "home",
};

describe("POST /api/ai/chat", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRatelimitLimit.mockResolvedValue({ success: true, limit: 5, reset: 9999999999, remaining: 4 });
    mockToTextStreamResponse.mockReturnValue(new Response("stream", { status: 200 }));
    vi.mocked(getOmenaiContext).mockResolvedValue("You are an AI assistant for Omenai.");
    vi.mocked(streamText).mockReturnValue({ toTextStreamResponse: mockToTextStreamResponse } as any);
  });

  it("returns 200 streaming response on success", async () => {
    const response = await POST(makeRequest(validBody));

    expect(response.status).toBe(200);
  });

  it("returns 429 when rate limit is exceeded", async () => {
    mockRatelimitLimit.mockResolvedValueOnce({
      success: false,
      limit: 5,
      reset: 9999999999,
      remaining: 0,
    });

    const response = await POST(makeRequest(validBody));

    expect(response.status).toBe(429);
  });

  it("includes rate limit headers in 429 response", async () => {
    mockRatelimitLimit.mockResolvedValueOnce({
      success: false,
      limit: 5,
      reset: 1234567890,
      remaining: 0,
    });

    const response = await POST(makeRequest(validBody));

    expect(response.headers.get("X-RateLimit-Limit")).toBe("5");
    expect(response.headers.get("X-RateLimit-Remaining")).toBe("0");
    expect(response.headers.get("X-RateLimit-Reset")).toBe("1234567890");
  });

  it("calls getOmenaiContext with pageContext from request", async () => {
    await POST(makeRequest({ ...validBody, pageContext: "gallery" }));

    expect(getOmenaiContext).toHaveBeenCalledWith("gallery");
  });

  it("passes only the last 6 messages to streamText", async () => {
    const messages = Array.from({ length: 8 }, (_, i) => ({
      role: i % 2 === 0 ? "user" : "assistant",
      content: `Message ${i + 1}`,
    }));

    await POST(makeRequest({ messages, pageContext: "home" }));

    const callArgs = vi.mocked(streamText).mock.calls[0][0];
    expect(callArgs.messages).toHaveLength(6);
    expect(callArgs.messages[0].content).toBe("Message 3");
    expect(callArgs.messages[5].content).toBe("Message 8");
  });

  it("calls streamText with temperature 1", async () => {
    await POST(makeRequest(validBody));

    expect(streamText).toHaveBeenCalledWith(
      expect.objectContaining({ temperature: 1 }),
    );
  });

  it("calls streamText with the google gemini model", async () => {
    await POST(makeRequest(validBody));

    expect(google).toHaveBeenCalledWith("gemini-2.5-flash");
    expect(streamText).toHaveBeenCalledWith(
      expect.objectContaining({ model: "gemini-model" }),
    );
  });

  it("calls streamText with system context from getOmenaiContext", async () => {
    vi.mocked(getOmenaiContext).mockResolvedValueOnce("Custom system context");

    await POST(makeRequest(validBody));

    expect(streamText).toHaveBeenCalledWith(
      expect.objectContaining({ system: "Custom system context" }),
    );
  });
});
