import { describe, it, expect, vi, beforeEach } from "vitest";

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
      findOne: vi.fn(),
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

import { GET } from "../../../../app/api/admin/support/id/route";
import SupportTicket from "@omenai/shared-models/models/support/SupportTicketSchema";

function makeRequest(ticketId?: string): Request {
  const url = ticketId
    ? `http://localhost/api/admin/support/id?id=${ticketId}`
    : "http://localhost/api/admin/support/id";
  return new Request(url, { method: "GET" });
}

const mockTicket = {
  ticketId: "TK-001",
  status: "open",
  priority: "high",
  category: "billing",
};

describe("GET /api/admin/support/id", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 200 with the ticket when found", async () => {
    vi.mocked(SupportTicket.findOne).mockReturnValue({
      lean: vi.fn().mockResolvedValue(mockTicket),
    } as any);

    const response = await GET(makeRequest("TK-001"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toEqual(mockTicket);
  });

  it("returns 404 when ticket is not found", async () => {
    vi.mocked(SupportTicket.findOne).mockReturnValue({
      lean: vi.fn().mockResolvedValue(null),
    } as any);

    const response = await GET(makeRequest("TK-NOTEXIST"));
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.error).toBe("Ticket not found");
  });

  it("returns 400 when id param is missing", async () => {
    const response = await GET(makeRequest());
    const body = await response.json();

    expect(response.status).toBe(400);
  });
});
