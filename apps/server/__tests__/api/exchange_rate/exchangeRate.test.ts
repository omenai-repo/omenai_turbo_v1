import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("@omenai/shared-lib/auth/middleware/rate_limit_middleware", () => ({
  withRateLimit: () => (fn: any) => fn,
}));

vi.mock("@omenai/shared-lib/auth/configs/rate_limit_configs", () => ({
  lenientRateLimit: {},
}));

vi.mock("../../../app/api/util", async () => {
  const { buildValidateRequestBodyMock } = await import("../../helpers/util-mock");
  return buildValidateRequestBodyMock();
});

import { POST } from "../../../app/api/exchange_rate/route";
import { validateRequestBody } from "../../../app/api/util";

const mockExchangeResult = { conversion_result: 1250.5, conversion_rate: 0.0008 };

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/exchange_rate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/exchange_rate", () => {
  let fetchSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.EXCHANGE_RATE_API_KEY = "test-api-key";
    fetchSpy = vi.fn().mockResolvedValue({
      json: vi.fn().mockResolvedValue(mockExchangeResult),
    });
    vi.stubGlobal("fetch", fetchSpy);
    vi.mocked(validateRequestBody).mockImplementation(
      async (request: Request, schema: any) => {
        const body = await request.json();
        const result = schema.safeParse(body);
        if (!result.success) {
          throw Object.assign(new Error("Validation Failed"), { name: "BadRequestError" });
        }
        return result.data;
      },
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns 200 with conversion result and rate", async () => {
    const response = await POST(makeRequest({ currency: "NGN", amount: 1000000 }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toBe(mockExchangeResult.conversion_result);
    expect(body.rate).toBe(mockExchangeResult.conversion_rate);
  });

  it("calls exchange rate API with correct currency and amount", async () => {
    await POST(makeRequest({ currency: "GBP", amount: 500 }));

    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining("GBP/USD/500"),
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("includes API key in the request URL", async () => {
    await POST(makeRequest({ currency: "NGN", amount: 100 }));

    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining("test-api-key"),
      expect.anything(),
    );
  });

  it("returns 400 when currency is missing", async () => {
    const response = await POST(makeRequest({ amount: 100 }));

    expect(response.status).toBe(400);
  });

  it("returns 400 when amount is missing", async () => {
    const response = await POST(makeRequest({ currency: "NGN" }));

    expect(response.status).toBe(400);
  });

  it("returns 500 when fetch throws", async () => {
    fetchSpy.mockRejectedValue(new Error("Network error"));

    const response = await POST(makeRequest({ currency: "NGN", amount: 100 }));

    expect(response.status).toBe(500);
  });
});
