import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@omenai/shared-lib/auth/middleware/combined_middleware", () => ({
  withRateLimitHighlightAndCsrf: () => (fn: any) => fn,
}));

vi.mock("@omenai/shared-lib/auth/configs/rate_limit_configs", () => ({
  standardRateLimit: {},
}));

vi.mock("../../../../app/api/util", async () => {
  const { buildValidateGetRouteParamsMock } = await import("../../../helpers/util-mock");
  return buildValidateGetRouteParamsMock();
});

import { GET } from "../../../../app/api/wallet/accounts/get_banks/route";

function makeRequest(countryCode?: string): Request {
  const url = countryCode
    ? `http://localhost/api/wallet/accounts/get_banks?countryCode=${countryCode}`
    : "http://localhost/api/wallet/accounts/get_banks";
  return new Request(url, { method: "GET" });
}

const mockBanks = [
  { id: 1, code: "044", name: "Access Bank" },
  { id: 2, code: "057", name: "Zenith Bank" },
];

describe("GET /api/wallet/accounts/get_banks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 200 with bank list on success", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({ data: mockBanks }),
    } as any);

    const response = await GET(makeRequest("NG"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Banks fetched successfully");
    expect(body.banks).toEqual(mockBanks);
    expect(body.no_of_banks).toBe(2);
  });

  it("returns FLW error status when FLW API fails", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: vi.fn().mockResolvedValue({ message: "Invalid country code" }),
    } as any);

    const response = await GET(makeRequest("XX"));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toBe("Invalid country code");
  });

  it("returns 400 when countryCode param is missing", async () => {
    const response = await GET(makeRequest());

    expect(response.status).toBe(400);
  });
});
