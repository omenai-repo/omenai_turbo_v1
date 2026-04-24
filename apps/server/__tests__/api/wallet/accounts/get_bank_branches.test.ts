import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@omenai/shared-lib/auth/middleware/combined_middleware", () => ({
  withRateLimitHighlightAndCsrf: () => (fn: any) => fn,
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

import { GET } from "../../../../app/api/wallet/accounts/get_bank_branches/route";

function makeRequest(bankCode?: string): Request {
  const url = bankCode
    ? `http://localhost/api/wallet/accounts/get_bank_branches?bankCode=${bankCode}`
    : "http://localhost/api/wallet/accounts/get_bank_branches";
  return new Request(url, { method: "GET" });
}

const mockBranches = [
  { id: 1, branch_code: "001", branch_name: "Lagos Island" },
  { id: 2, branch_code: "002", branch_name: "Abuja" },
];

describe("GET /api/wallet/accounts/get_bank_branches", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 200 with branch list on success", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({ data: mockBranches }),
    } as any);

    const response = await GET(makeRequest("057"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Bank branches fetched successfully");
    expect(body.bank_branches).toEqual(mockBranches);
    expect(body.no_of_bank_branches).toBe(2);
  });

  it("returns 200 with empty branches when FLW returns no branches error", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: vi
        .fn()
        .mockResolvedValue({ message: "No branches found for specified bank id" }),
    } as any);

    const response = await GET(makeRequest("999"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.bank_branches).toEqual([]);
    expect(body.no_of_bank_branches).toBe(0);
  });

  it("returns 400 when bankCode param is missing", async () => {
    const response = await GET(makeRequest());
    const body = await response.json();

    expect(response.status).toBe(400);
  });
});
