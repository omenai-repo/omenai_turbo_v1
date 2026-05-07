import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@omenai/shared-lib/auth/middleware/combined_middleware", () => ({
  withRateLimitHighlightAndCsrf: () => (fn: any) => fn,
}));

vi.mock("@omenai/shared-lib/auth/configs/rate_limit_configs", () => ({
  strictRateLimit: {},
}));

vi.mock("@omenai/shared-lib/mongo_connect/mongoConnect", () => ({
  connectMongoDB: vi.fn().mockResolvedValue(undefined),
}));

vi.mock(
  "@omenai/shared-models/models/support/SupportTicketSchema",
  () => ({
    default: {
      findOneAndUpdate: vi.fn(),
    },
  }),
);

vi.mock("../../../../app/api/util", async () => {
  const { buildCombinedValidatorsMock } = await import("../../../helpers/util-mock");
  return buildCombinedValidatorsMock();
});

import { PATCH } from "../../../../app/api/admin/support/patch/route";
import SupportTicket from "@omenai/shared-models/models/support/SupportTicketSchema";

function makeRequest(ticketId: string | undefined, body: object): Request {
  const url = ticketId
    ? `http://localhost/api/admin/support/patch?id=${ticketId}`
    : "http://localhost/api/admin/support/patch";
  return new Request(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const mockUpdatedTicket = {
  ticketId: "TK-001",
  status: "resolved",
  priority: "low",
};

describe("PATCH /api/admin/support/patch", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(SupportTicket.findOneAndUpdate).mockResolvedValue(
      mockUpdatedTicket,
    );
  });

  it("returns 200 with updated ticket", async () => {
    const response = await PATCH(
      makeRequest("TK-001", { status: "resolved", priority: "low" }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toEqual(mockUpdatedTicket);
  });

  it("returns 400 when id param is missing", async () => {
    const response = await PATCH(
      makeRequest(undefined, { status: "resolved", priority: "low" }),
    );

    expect(response.status).toBe(400);
  });

  it("returns 404 when ticket is not found", async () => {
    vi.mocked(SupportTicket.findOneAndUpdate).mockResolvedValue(null);

    const response = await PATCH(
      makeRequest("TK-999", { status: "resolved", priority: "low" }),
    );
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.message).toBeDefined();
  });

  it("returns 400 when status is missing in body", async () => {
    const response = await PATCH(
      makeRequest("TK-001", { priority: "low" }),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });
});
