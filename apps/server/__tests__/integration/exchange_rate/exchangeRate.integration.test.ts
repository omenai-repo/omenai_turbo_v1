/**
 * Integration tests for POST /api/exchange_rate
 * Validates currency and amount, calls external exchange rate API, returns converted value.
 */
import { describe, it, expect, afterEach, vi } from "vitest";
import { POST } from "../../../app/api/exchange_rate/route";

const { mockFetch } = vi.hoisted(() => ({ mockFetch: vi.fn() }));
vi.stubGlobal("fetch", mockFetch);

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/exchange_rate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
  // Re-stub after clearing so subsequent tests in the same run can still mock
  vi.stubGlobal("fetch", mockFetch);
});

describe("POST /api/exchange_rate — validation", () => {
  it("returns 400 when currency is missing", async () => {
    const response = await POST(makeRequest({ amount: 1000 }));
    expect(response.status).toBe(400);
  });

  it("returns 400 when amount is missing", async () => {
    const response = await POST(makeRequest({ currency: "EUR" }));
    expect(response.status).toBe(400);
  });

  it("returns 400 when amount is a string instead of a number", async () => {
    const response = await POST(makeRequest({ currency: "EUR", amount: "1000" }));
    expect(response.status).toBe(400);
  });
});

describe("POST /api/exchange_rate — success", () => {
  it("returns 200 with conversion data when fetch succeeds", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ conversion_result: 1250.5, conversion_rate: 1.2505 }),
    });

    const response = await POST(makeRequest({ currency: "EUR", amount: 1000 }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toBe(1250.5);
    expect(body.rate).toBe(1.2505);
  });

  it("calls the exchange rate API with a URL containing the currency and amount", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ conversion_result: 1250.5, conversion_rate: 1.2505 }),
    });

    await POST(makeRequest({ currency: "EUR", amount: 1000 }));

    expect(mockFetch).toHaveBeenCalledOnce();
    const calledUrl: string = mockFetch.mock.calls[0][0];
    expect(calledUrl).toContain("EUR");
    expect(calledUrl).toContain("1000");
  });
});
