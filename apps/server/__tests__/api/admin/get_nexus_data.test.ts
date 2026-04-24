import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@omenai/shared-lib/auth/middleware/combined_middleware", () => ({
  withRateLimitHighlightAndCsrf: () => (fn: any) => fn,
}));

vi.mock("@omenai/shared-lib/auth/configs/rate_limit_configs", () => ({
  strictRateLimit: {},
}));

vi.mock("next/server", () => ({
  NextResponse: {
    json: (body: unknown, init?: ResponseInit) =>
      new Response(JSON.stringify(body), {
        ...init,
        headers: { "Content-Type": "application/json" },
      }),
  },
}));

vi.mock("@omenai/shared-lib/mongo_connect/mongoConnect", () => ({
  connectMongoDB: vi.fn().mockResolvedValue(undefined),
}));

vi.mock(
  "@omenai/shared-models/models/transactions/NexusModelSchema",
  () => ({
    NexusTransactions: {
      findOne: vi.fn(),
    },
  }),
);

vi.mock("@omenai/rollbar-config", () => ({
  rollbarServerInstance: { error: vi.fn() },
}));

vi.mock("../../../app/api/util", () => {
  class BadRequestError extends Error {
    constructor(message: string) {
      super(message);
      this.name = "BadRequestError";
    }
  }

  return {
    validateGetRouteParams: vi
      .fn()
      .mockImplementation((schema: any, data: any) => {
        const result = schema.safeParse(data);
        if (!result.success)
          throw new BadRequestError("Invalid URL parameters");
        return data;
      }),
    createErrorRollbarReport: vi.fn(),
  };
});

import { GET } from "../../../app/api/admin/get_nexus_data/route";
import { NexusTransactions } from "@omenai/shared-models/models/transactions/NexusModelSchema";

function makeRequest(code?: string): Request {
  const url = code
    ? `http://localhost/api/admin/get_nexus_data?code=${code}`
    : "http://localhost/api/admin/get_nexus_data";
  return new Request(url, { method: "GET" });
}

const mockNexus = {
  stateCode: "NG-LA",
  transactions: [],
};

describe("GET /api/admin/get_nexus_data", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 200 with nexus data", async () => {
    vi.mocked(NexusTransactions.findOne).mockResolvedValue(mockNexus);

    const response = await GET(makeRequest("NG-LA"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Data retrieved");
    expect(body.data).toEqual(mockNexus);
  });

  it("returns 500 when nexus data is not found", async () => {
    vi.mocked(NexusTransactions.findOne).mockResolvedValue(null);

    const response = await GET(makeRequest("XX-XX"));
    const body = await response.json();

    expect(response.status).toBe(500);
  });

  it("returns 400 when code param is missing", async () => {
    const response = await GET(makeRequest());
    const body = await response.json();

    expect(response.status).toBe(400);
  });
});
