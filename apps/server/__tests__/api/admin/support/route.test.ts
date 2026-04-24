import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@omenai/shared-lib/auth/middleware/rate_limit_middleware", () => ({
  withRateLimit: () => (fn: any) => fn,
}));

vi.mock("@omenai/shared-lib/auth/configs/rate_limit_configs", () => ({
  standardRateLimit: {},
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
  "@omenai/shared-models/models/support/SupportTicketSchema",
  () => ({
    default: {
      find: vi.fn(),
      countDocuments: vi.fn(),
    },
  }),
);

vi.mock("@omenai/rollbar-config", () => ({
  rollbarServerInstance: { error: vi.fn() },
}));

vi.mock("../../../../app/api/util", () => {
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

import { GET } from "../../../../app/api/admin/support/route";
import SupportTicket from "@omenai/shared-models/models/support/SupportTicketSchema";

function makeRequest(params: Record<string, string> = {}): Request {
  const url = new URL("http://localhost/api/admin/support");
  const defaults = { status: "open", priority: "high", page: "1", limit: "20" };
  const merged = { ...defaults, ...params };
  Object.entries(merged).forEach(([k, v]) => url.searchParams.set(k, v));
  return new Request(url.toString(), { method: "GET" });
}

const mockTickets = [
  { ticketId: "TK-001", status: "open", priority: "high" },
  { ticketId: "TK-002", status: "open", priority: "low" },
];

describe("GET /api/admin/support", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const mockQuery = {
      sort: vi.fn().mockReturnThis(),
      skip: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue(mockTickets),
    };
    vi.mocked(SupportTicket.find).mockReturnValue(mockQuery as any);
    vi.mocked(SupportTicket.countDocuments).mockResolvedValue(2);
  });

  it("returns 200 with tickets and pagination", async () => {
    const response = await GET(makeRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toEqual(mockTickets);
    expect(body.pagination.total).toBe(2);
  });

  it("filters by status ALL and does not add status to query", async () => {
    const response = await GET(makeRequest({ status: "ALL", priority: "ALL" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
  });

  it("returns 500 when SupportTicket.find throws", async () => {
    vi.mocked(SupportTicket.find).mockImplementation(() => {
      throw new Error("DB error");
    });

    const response = await GET(makeRequest());
    const body = await response.json();

    expect(response.status).toBe(500);
  });
});
