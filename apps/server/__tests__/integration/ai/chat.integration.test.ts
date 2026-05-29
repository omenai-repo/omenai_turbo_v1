/**
 * Integration tests for POST /api/ai/chat
 *
 * The route is stateless (no MongoDB) but depends on Upstash ratelimit,
 * Google AI SDK, and the ai/streamText helper. All external dependencies
 * are mocked at module level so tests run deterministically.
 */

import { describe, it, expect, beforeEach, vi } from "vitest";

// ── Module-level mocks ───────────────────────────────────────────────────────

const { mockRatelimitInstance } = vi.hoisted(() => ({
  mockRatelimitInstance: {
    limit: vi.fn().mockResolvedValue({
      success: true,
      limit: 5,
      reset: 0,
      remaining: 4,
    }),
  },
}));

vi.mock("@upstash/ratelimit", () => {
  function MockRatelimit() {
    return mockRatelimitInstance;
  }
  MockRatelimit.slidingWindow = function () {
    return {};
  };
  return { Ratelimit: MockRatelimit };
});

vi.mock("@ai-sdk/google", () => ({
  google: vi.fn(() => ({})),
}));

const { mockStreamText } = vi.hoisted(() => ({
  mockStreamText: vi.fn(),
}));

vi.mock("ai", () => ({
  streamText: mockStreamText,
}));

vi.mock("../../../app/api/ai/knowledgeBase", () => ({
  getOmenaiContext: vi
    .fn()
    .mockResolvedValue("You are an AI assistant for Omenai."),
}));

import { POST } from "../../../app/api/ai/chat/route";

// ── Request factory ───────────────────────────────────────────────────────────

function makeRequest(
  body: object,
  headers: Record<string, string> = {},
): Request {
  return new Request("http://localhost/api/ai/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

// ── Setup ─────────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();

  mockRatelimitInstance.limit.mockResolvedValue({
    success: true,
    limit: 5,
    reset: 0,
    remaining: 4,
  });

  mockStreamText.mockReturnValue({
    toTextStreamResponse: vi
      .fn()
      .mockReturnValue(new Response("OK", { status: 200 })),
  });
});

// ── Rate limiting ─────────────────────────────────────────────────────────────

describe("POST /api/ai/chat — rate limiting", () => {
  it("returns 429 when rate limit is exceeded", async () => {
    mockRatelimitInstance.limit.mockResolvedValue({
      success: false,
      limit: 5,
      reset: Date.now() + 86400000,
      remaining: 0,
    });

    const res = await POST(
      makeRequest({
        messages: [{ role: "user", content: "Hello" }],
        pageContext: "general",
      }),
    );

    expect(res.status).toBe(429);
  });
});

// ── Validation ────────────────────────────────────────────────────────────────

describe("POST /api/ai/chat — validation", () => {
  it("returns 400 when messages is missing", async () => {
    const res = await POST(makeRequest({ pageContext: "general" }));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });

  it("returns 400 when pageContext is missing", async () => {
    const res = await POST(
      makeRequest({ messages: [{ role: "user", content: "Hi" }] }),
    );
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });
});

// ── Happy path ────────────────────────────────────────────────────────────────

describe("POST /api/ai/chat — success", () => {
  it("calls streamText and returns its response when valid request", async () => {
    const res = await POST(
      makeRequest({
        messages: [{ role: "user", content: "What is Omenai?" }],
        pageContext: "general",
      }),
    );

    expect(res.status).toBe(200);
    expect(mockStreamText).toHaveBeenCalled();
  });

  it("only sends last 6 messages to streamText", async () => {
    const msgs = Array.from({ length: 10 }, (_, i) => ({
      role: "user",
      content: `msg ${i}`,
    }));

    const res = await POST(
      makeRequest({ messages: msgs, pageContext: "general" }),
    );

    expect(res.status).toBe(200);
    expect(mockStreamText).toHaveBeenCalledWith(
      expect.objectContaining({ messages: msgs.slice(-6) }),
    );
  });

  it("passes the system context returned by getOmenaiContext to streamText", async () => {
    await POST(
      makeRequest({
        messages: [{ role: "user", content: "Hello" }],
        pageContext: "general",
      }),
    );

    expect(mockStreamText).toHaveBeenCalledWith(
      expect.objectContaining({
        system: "You are an AI assistant for Omenai.",
      }),
    );
  });

  it("uses the client IP from x-forwarded-for header for rate limiting", async () => {
    const res = await POST(
      makeRequest(
        {
          messages: [{ role: "user", content: "Hi" }],
          pageContext: "general",
        },
        { "x-forwarded-for": "1.2.3.4" },
      ),
    );

    expect(res.status).toBe(200);
    expect(mockRatelimitInstance.limit).toHaveBeenCalledWith("1.2.3.4");
  });
});
