import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("@omenai/shared-lib/auth/middleware/combined_middleware", () => ({
  withRateLimitHighlightAndCsrf: () => (fn: any) => fn,
}));

vi.mock("@omenai/shared-lib/auth/configs/rate_limit_configs", () => ({
  strictRateLimit: {},
}));

vi.mock("../../../app/api/util", () => ({
  createErrorRollbarReport: vi.fn(),
}));

import { GET } from "../../../app/api/flw/getTransferRate/route";

const mockRateData = {
  source: { currency: "GBP", amount: 78.5 },
  destination: { currency: "USD", amount: 100 },
};

function makeRequest(params: Record<string, string> = {}): Request {
  const url = new URL("http://localhost/api/flw/getTransferRate");
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return new Request(url.toString(), { method: "GET" });
}

describe("GET /api/flw/getTransferRate", () => {
  let fetchSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ data: mockRateData }),
    });
    vi.stubGlobal("fetch", fetchSpy);
    process.env.FLW_SECRET_KEY = "test-flw-key";
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns 200 with transfer rate data on success", async () => {
    const response = await GET(
      makeRequest({ source: "GBP", destination: "USD", amount: "100" }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Transfer rate retrieved");
    expect(body.data).toEqual(mockRateData);
  });

  it("calls FLW rates endpoint with uppercased currency codes", async () => {
    await GET(makeRequest({ source: "gbp", destination: "usd", amount: "100" }));

    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining("source_currency=GBP"),
      expect.anything(),
    );
    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining("destination_currency=USD"),
      expect.anything(),
    );
  });

  it("includes authorization header in FLW request", async () => {
    await GET(makeRequest({ source: "GBP", destination: "USD", amount: "100" }));

    const [, options] = fetchSpy.mock.calls[0];
    expect(options.headers.Authorization).toBe("Bearer test-flw-key");
  });

  it("returns 400 when source param is missing", async () => {
    const response = await GET(makeRequest({ destination: "USD", amount: "100" }));
    const body = await response.json();

    expect(response.status).toBe(400);
  });

  it("returns 400 when destination param is missing", async () => {
    const response = await GET(makeRequest({ source: "GBP", amount: "100" }));

    expect(response.status).toBe(400);
  });

  it("returns 400 when FLW API responds with not ok status", async () => {
    fetchSpy.mockResolvedValue({
      ok: false,
      json: vi.fn().mockResolvedValue({ message: "Invalid currency" }),
    });

    const response = await GET(
      makeRequest({ source: "GBP", destination: "USD", amount: "100" }),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toBe("Invalid currency");
  });

  it("returns 500 when fetch throws", async () => {
    fetchSpy.mockRejectedValue(new Error("Network error"));

    const response = await GET(
      makeRequest({ source: "GBP", destination: "USD", amount: "100" }),
    );

    expect(response.status).toBe(500);
  });
});
