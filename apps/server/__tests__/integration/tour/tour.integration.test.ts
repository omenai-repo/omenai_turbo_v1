/**
 * Integration tests for GET /api/tour
 *
 * Redis is already mocked in setup.ts (cold-cache, returns empty data by
 * default). Individual tests override redis.smembers to simulate stored tour
 * progress data.
 */

import { describe, it, expect, afterEach, vi } from "vitest";
import { redis } from "@omenai/upstash-config";

import { GET } from "../../../app/api/tour/route";

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeRequest(id?: string): Request {
  const url = new URL("http://localhost/api/tour");
  if (id !== undefined) url.searchParams.set("id", id);
  return new Request(url.toString(), { method: "GET" });
}

// ── Cleanup ───────────────────────────────────────────────────────────────────

afterEach(() => {
  vi.clearAllMocks();
});

// ── Happy path ────────────────────────────────────────────────────────────────

describe("GET /api/tour — happy path", () => {
  it("returns 200 with completedTours from Redis", async () => {
    vi.mocked(redis.smembers).mockResolvedValueOnce(["welcome", "artwork-upload"] as any);

    const res = await GET(makeRequest("user-abc"));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.message).toBe("Tours list fetched");
    expect(body.completedTours).toEqual(["welcome", "artwork-upload"]);
  });

  it("queries Redis with the key pattern tours:<id>", async () => {
    vi.mocked(redis.smembers).mockResolvedValueOnce([] as any);

    await GET(makeRequest("user-xyz"));

    expect(redis.smembers).toHaveBeenCalledWith("tours:user-xyz");
  });

  it("returns empty completedTours array when Redis has no data for the user", async () => {
    vi.mocked(redis.smembers).mockResolvedValueOnce([] as any);

    const res = await GET(makeRequest("user-new"));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.completedTours).toEqual([]);
  });

  it("parses JSON-stringified array stored in Redis", async () => {
    vi.mocked(redis.smembers).mockResolvedValueOnce('["step-1","step-2"]' as any);

    const res = await GET(makeRequest("user-json"));
    const body = await res.json();

    expect(body.completedTours).toEqual(["step-1", "step-2"]);
  });

  it("returns 200 with empty tours when Redis throws (inner error is swallowed)", async () => {
    vi.mocked(redis.smembers).mockRejectedValueOnce(new Error("Redis connection refused"));

    const res = await GET(makeRequest("user-redis-fail"));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.completedTours).toEqual([]);
  });

  it("returns multiple completed tour steps", async () => {
    const tours = ["intro", "gallery-setup", "first-upload", "payment-method"];
    vi.mocked(redis.smembers).mockResolvedValueOnce(tours as any);

    const res = await GET(makeRequest("user-advanced"));
    const body = await res.json();

    expect(body.completedTours).toHaveLength(4);
    expect(body.completedTours).toEqual(tours);
  });
});

// ── Validation ────────────────────────────────────────────────────────────────

describe("GET /api/tour — validation", () => {
  it("returns 400 when id query param is missing", async () => {
    const res = await GET(makeRequest());

    expect(res.status).toBe(400);
  });

  it("does not call Redis when id param is missing", async () => {
    await GET(makeRequest());

    expect(redis.smembers).not.toHaveBeenCalled();
  });
});
