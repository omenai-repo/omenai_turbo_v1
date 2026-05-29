/**
 * Integration tests for GET /api/flw/getTransferRate
 * Validates source, destination, and amount query params, calls Flutterwave API for rates.
 */
import { describe, it, expect, afterEach, vi } from "vitest";
import { GET } from "../../../app/api/flw/getTransferRate/route";

const { mockFetch } = vi.hoisted(() => ({ mockFetch: vi.fn() }));
vi.stubGlobal("fetch", mockFetch);

function makeRequest(params: Record<string, string> = {}): Request {
  const url = new URL("http://localhost/api/flw/getTransferRate");
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return new Request(url.toString(), { method: "GET" });
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
  vi.stubGlobal("fetch", mockFetch);
});

describe("GET /api/flw/getTransferRate — validation", () => {
  it("returns 400 with 'Invalid url params' when source is missing", async () => {
    const response = await GET(makeRequest({ destination: "NGN", amount: "100" }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/invalid url params/i);
  });

  it("returns 400 when destination is missing", async () => {
    const response = await GET(makeRequest({ source: "USD", amount: "100" }));
    expect(response.status).toBe(400);
  });

  it("returns 400 when amount is missing", async () => {
    const response = await GET(makeRequest({ source: "USD", destination: "NGN" }));
    expect(response.status).toBe(400);
  });
});

describe("GET /api/flw/getTransferRate — success", () => {
  it("returns 200 with 'Transfer rate retrieved' when fetch is ok", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: { rate: 1500 } }),
    });

    const response = await GET(
      makeRequest({ source: "USD", destination: "NGN", amount: "100" }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Transfer rate retrieved");
    expect(body.data.rate).toBe(1500);
  });
});

describe("GET /api/flw/getTransferRate — fetch not ok", () => {
  it("returns 400 when the Flutterwave API responds with an error", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: "Rate unavailable" }),
    });

    const response = await GET(
      makeRequest({ source: "USD", destination: "NGN", amount: "100" }),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toBe("Rate unavailable");
  });
});
