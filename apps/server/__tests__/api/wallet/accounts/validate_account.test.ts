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
    validateRequestBody: vi
      .fn()
      .mockImplementation(async (request: Request, schema: any) => {
        let body: unknown;
        try {
          body = await request.json();
        } catch {
          throw new BadRequestError(
            "Invalid JSON syntax: Request body could not be parsed.",
          );
        }
        const result = schema.safeParse(body);
        if (!result.success) {
          const msg = result.error.issues
            .map((e: any) => `${e.path.join(".")}: ${e.message}`)
            .join(", ");
          throw new BadRequestError(`Validation Failed: ${msg}`);
        }
        return result.data;
      }),
    createErrorRollbarReport: vi.fn(),
  };
});

import { POST } from "../../../../app/api/wallet/accounts/validate_account/route";

function makeRequest(body: object): Request {
  return new Request(
    "http://localhost/api/wallet/accounts/validate_account",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  );
}

const mockAccountData = {
  account_number: "0123456789",
  account_name: "John Doe",
};

const validBody = { bankCode: "057", accountNumber: "0123456789" };

describe("POST /api/wallet/accounts/validate_account", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 200 with account data when validation succeeds", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({ data: mockAccountData }),
    } as any);

    const response = await POST(makeRequest(validBody));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Bank account validated successfully");
    expect(body.account_data).toEqual(mockAccountData);
    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.flutterwave.com/v3/accounts/resolve",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("returns FLW error status when account validation fails", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: vi
        .fn()
        .mockResolvedValue({ message: "Sorry, we could not verify that account number" }),
    } as any);

    const response = await POST(makeRequest(validBody));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/could not verify/i);
  });

  it("returns 400 when bankCode is missing", async () => {
    const response = await POST(
      makeRequest({ accountNumber: "0123456789" }),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });

  it("returns 400 when accountNumber is missing", async () => {
    const response = await POST(makeRequest({ bankCode: "057" }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });
});
