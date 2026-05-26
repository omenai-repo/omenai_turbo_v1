import { vi, beforeAll, afterAll } from "vitest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongoServer: MongoMemoryServer;

// ── Infrastructure mocks ─────────────────────────────────────────────────────
// These never form part of the integration under test, so they stay mocked.

vi.mock("next/server", () => ({
  NextResponse: {
    json: (body: unknown, init?: ResponseInit) =>
      new Response(JSON.stringify(body), {
        ...init,
        headers: { "Content-Type": "application/json" },
      }),
  },
}));

vi.mock("@omenai/rollbar-config", () => ({
  rollbarServerInstance: { error: vi.fn(), critical: vi.fn() },
}));

vi.mock("@omenai/shared-lib/auth/middleware/combined_middleware", () => ({
  withRateLimitHighlightAndCsrf: () => (fn: any) => fn,
}));

vi.mock("@omenai/shared-lib/auth/middleware/rate_limit_middleware", () => ({
  withRateLimit: () => (fn: any) => fn,
}));

vi.mock("@omenai/shared-lib/auth/configs/rate_limit_configs", () => ({
  strictRateLimit: {},
  standardRateLimit: {},
  lenientRateLimit: {},
  fortKnoxRateLimit: {},
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn().mockResolvedValue({}),
}));

// stripe initialises itself at import time and throws when STRIPE_SK is absent.
// Mock the module so util.ts can load without a real key.
vi.mock("@omenai/shared-lib/payments/stripe/stripe", () => ({
  stripe: {
    tax: { transactions: { createFromCalculation: vi.fn() } },
  },
}));

// Redis (Upstash) — always simulate a cold cache so routes fall back to MongoDB.
vi.mock("@omenai/upstash-config", () => ({
  redis: {
    mget: vi.fn().mockImplementation((...keys: string[]) =>
      Promise.resolve(Array(keys.length).fill(null)),
    ),
    get: vi.fn().mockResolvedValue(null),
    set: vi.fn().mockResolvedValue("OK"),
    del: vi.fn().mockResolvedValue(1),
    scan: vi.fn().mockResolvedValue([0, []]),
  },
}));

// Replace connectMongoDB with one that targets the in-memory server.
// The real implementation throws at import time when MONGODB_URI is absent,
// so we must intercept the whole module rather than set an env var.
vi.mock("@omenai/shared-lib/mongo_connect/mongoConnect", () => ({
  connectMongoDB: vi.fn().mockImplementation(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoServer.getUri());
    }
  }),
}));

// ── Lifecycle ────────────────────────────────────────────────────────────────

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});
