import { describe, it, expect, vi, beforeEach } from "vitest";

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

vi.mock("../../../../app/api/util", async () => {
  const { buildValidateGetRouteParamsMock } = await import("../../../helpers/util-mock");
  return buildValidateGetRouteParamsMock();
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

    expect(response.status).toBe(400);
  });
});
