import { describe, it, expect, vi, beforeEach } from "vitest";

// mocks must be declared before the route import

vi.mock("@omenai/shared-lib/auth/middleware/combined_middleware", () => ({
  withRateLimitHighlightAndCsrf: () => (fn: any) => fn,
}));

vi.mock("@omenai/shared-lib/auth/configs/rate_limit_configs", () => ({
  strictRateLimit: {},
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

vi.mock("next/headers", () => ({
  cookies: vi.fn().mockResolvedValue({}),
}));

vi.mock("@omenai/shared-lib/mongo_connect/mongoConnect", () => ({
  connectMongoDB: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@omenai/shared-models/models/auth/AccountAdmin", () => ({
  AccountAdmin: {
    findOne: vi.fn(),
  },
}));

vi.mock("bcrypt", () => ({
  default: { compareSync: vi.fn() },
}));

vi.mock("@omenai/shared-lib/auth/session", () => ({
  createSession: vi.fn().mockResolvedValue("mock-session-id"),
  getSessionFromCookie: vi.fn().mockResolvedValue({
    sessionId: null,
    save: vi.fn().mockResolvedValue(undefined),
  }),
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

import { POST } from "../../../../app/api/auth/admin/login/route";
import { AccountAdmin } from "@omenai/shared-models/models/auth/AccountAdmin";
import bcrypt from "bcrypt";
import {
  createSession,
  getSessionFromCookie,
} from "@omenai/shared-lib/auth/session";

function makeRequest(
  body: object,
  headers: Record<string, string> = {},
): Request {
  return new Request("http://localhost/api/auth/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

const mockAdmin = {
  admin_id: "admin-abc-123",
  name: "Test Admin",
  email: "admin@example.com",
  password: "$2b$10$hashedpassword",
  role: "admin",
  verified: true,
  access_role: "Admin",
  admin_active: true,
  joinedAt: "2024-01-01",
};

function mockFindOne(value: typeof mockAdmin | null) {
  const chain = {
    exec: vi.fn().mockResolvedValue(value),
  };
  vi.mocked(AccountAdmin.findOne).mockReturnValue(chain as any);
}

describe("POST /api/auth/admin/login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 200 with session data for valid credentials", async () => {
    mockFindOne(mockAdmin);
    vi.mocked(bcrypt.compareSync).mockReturnValue(true as never);

    const response = await POST(
      makeRequest({ email: "admin@example.com", password: "password123" }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Login successful");
    expect(body.data.email).toBe("admin@example.com");
    expect(body.data.role).toBe("admin");
    expect(body.data.access_role).toBe("Admin");
  });

  it("calls createSession and saves the session cookie", async () => {
    mockFindOne(mockAdmin);
    vi.mocked(bcrypt.compareSync).mockReturnValue(true as never);
    const mockSave = vi.fn().mockResolvedValue(undefined);
    vi.mocked(getSessionFromCookie).mockResolvedValue({
      sessionId: null,
      save: mockSave,
    } as any);

    await POST(
      makeRequest({ email: "admin@example.com", password: "password123" }),
    );

    expect(createSession).toHaveBeenCalledOnce();
    expect(mockSave).toHaveBeenCalledOnce();
  });

  it("returns 409 when admin account is not found", async () => {
    mockFindOne(null);
    vi.mocked(bcrypt.compareSync).mockReturnValue(false as never);

    const response = await POST(
      makeRequest({ email: "ghost@example.com", password: "whatever" }),
    );
    const body = await response.json();

    expect(response.status).toBe(409);
    expect(body.message).toBe("Invalid credentials");
  });

  it("returns 403 when admin account is not yet verified", async () => {
    mockFindOne({ ...mockAdmin, verified: false });
    vi.mocked(bcrypt.compareSync).mockReturnValue(true as never);

    const response = await POST(
      makeRequest({ email: "admin@example.com", password: "password123" }),
    );
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.message).toBe(
      "Please activate your admin account to proceed.",
    );
  });

  it("returns 409 when password does not match", async () => {
    mockFindOne(mockAdmin);
    vi.mocked(bcrypt.compareSync).mockReturnValue(false as never);

    const response = await POST(
      makeRequest({ email: "admin@example.com", password: "wrongpassword" }),
    );
    const body = await response.json();

    expect(response.status).toBe(409);
    expect(body.message).toBe("Invalid credentials");
  });

  it("returns 400 when email is missing", async () => {
    const response = await POST(makeRequest({ password: "password123" }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });

  it("returns 400 when email format is invalid", async () => {
    const response = await POST(
      makeRequest({ email: "not-an-email", password: "password123" }),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });

  it("returns 400 when password is missing", async () => {
    const response = await POST(makeRequest({ email: "admin@example.com" }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });
});
