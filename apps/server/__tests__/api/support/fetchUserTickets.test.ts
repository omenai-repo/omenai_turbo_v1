import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@omenai/shared-lib/mongo_connect/mongoConnect", () => ({
  connectMongoDB: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@omenai/shared-models/models/support/SupportTicketSchema", () => ({
  default: {
    find: vi.fn(),
    countDocuments: vi.fn(),
  },
}));

vi.mock("../../../app/api/util", () => ({
  createErrorRollbarReport: vi.fn(),
  getSessionData: vi.fn(),
}));

import { GET } from "../../../app/api/support/fetchUserTickets/route";
import SupportTicket from "@omenai/shared-models/models/support/SupportTicketSchema";

const mockTickets = [
  { ticketId: "OM_TICKET_100001", category: "GENERAL", status: "OPEN", priority: "NORMAL" },
  { ticketId: "OM_TICKET_100002", category: "PAYMENT", status: "RESOLVED", priority: "HIGH" },
];

function makeRequest(params: Record<string, string> = {}): Request {
  const url = new URL("http://localhost/api/support/fetchUserTickets");
  url.searchParams.set("id", "user-123");
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return new Request(url.toString(), { method: "GET" });
}

function makeQueryChain(tickets: any[], count = 2) {
  const chain = {
    sort: vi.fn().mockReturnThis(),
    skip: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    lean: vi.fn().mockResolvedValue(tickets),
  };
  vi.mocked(SupportTicket.find).mockReturnValue(chain as any);
  vi.mocked(SupportTicket.countDocuments).mockResolvedValue(count);
  return chain;
}

describe("GET /api/support/fetchUserTickets", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    makeQueryChain(mockTickets);
  });

  it("returns 200 with tickets and pagination", async () => {
    const response = await GET(makeRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toEqual(mockTickets);
    expect(body.pagination).toEqual({
      total: 2,
      page: 1,
      limit: 10,
      totalPages: 1,
    });
  });

  it("scopes query to the provided user id", async () => {
    await GET(makeRequest({ id: "user-xyz" }));

    expect(SupportTicket.find).toHaveBeenCalledWith(
      expect.objectContaining({ userId: "user-xyz" }),
    );
  });

  it("adds status filter when status is not ALL", async () => {
    await GET(makeRequest({ status: "OPEN" }));

    expect(SupportTicket.find).toHaveBeenCalledWith(
      expect.objectContaining({ status: "OPEN" }),
    );
  });

  it("omits status from query when status is ALL", async () => {
    await GET(makeRequest({ status: "ALL" }));

    const callArg = vi.mocked(SupportTicket.find).mock.calls[0][0];
    expect(callArg).not.toHaveProperty("status");
  });

  it("adds priority filter when priority is not ALL", async () => {
    await GET(makeRequest({ priority: "HIGH" }));

    expect(SupportTicket.find).toHaveBeenCalledWith(
      expect.objectContaining({ priority: "HIGH" }),
    );
  });

  it("adds $or search filter when search param is provided", async () => {
    await GET(makeRequest({ search: "payment" }));

    expect(SupportTicket.find).toHaveBeenCalledWith(
      expect.objectContaining({
        $or: [
          { ticketId: { $regex: "payment", $options: "i" } },
          { message: { $regex: "payment", $options: "i" } },
        ],
      }),
    );
  });

  it("adds createdAt date range filter when year is not ALL", async () => {
    await GET(makeRequest({ year: "2025" }));

    expect(SupportTicket.find).toHaveBeenCalledWith(
      expect.objectContaining({
        createdAt: {
          $gte: new Date("2025-01-01"),
          $lte: new Date("2025-12-31T23:59:59.999Z"),
        },
      }),
    );
  });

  it("applies correct skip for page 2", async () => {
    makeQueryChain(mockTickets, 20);
    await GET(makeRequest({ page: "2", limit: "5" }));

    const chain = vi.mocked(SupportTicket.find).mock.results[0].value;
    expect(chain.skip).toHaveBeenCalledWith(5); // (2-1) * 5
    expect(chain.limit).toHaveBeenCalledWith(5);
  });

  it("defaults to page 1 and limit 10", async () => {
    await GET(makeRequest());

    const chain = vi.mocked(SupportTicket.find).mock.results[0].value;
    expect(chain.skip).toHaveBeenCalledWith(0);
    expect(chain.limit).toHaveBeenCalledWith(10);
  });

  it("returns 200 with empty data when no tickets found", async () => {
    makeQueryChain([], 0);

    const response = await GET(makeRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toEqual([]);
    expect(body.pagination.total).toBe(0);
  });

  it("returns 500 when SupportTicket.find throws", async () => {
    vi.mocked(SupportTicket.find).mockImplementation(() => {
      throw new Error("DB error");
    });

    const response = await GET(makeRequest());
    const body = await response.json();

    expect(response.status).toBe(500);
  });

  it("returns 500 when countDocuments throws", async () => {
    vi.mocked(SupportTicket.countDocuments).mockRejectedValueOnce(
      new Error("Count failed"),
    );

    const response = await GET(makeRequest());
    const body = await response.json();

    expect(response.status).toBe(500);
  });
});
