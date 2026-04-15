import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Mocks must be declared before the route import ───────────────────────────

/**
 * Strip the middleware wrapper so POST is just the raw async handler.
 * withRateLimitHighlightAndCsrf(rateLimit)(handler) → handler
 */
vi.mock("@omenai/shared-lib/auth/middleware/combined_middleware", () => ({
  withRateLimitHighlightAndCsrf: () => (fn: any) => fn,
}));

vi.mock("@omenai/shared-lib/auth/configs/rate_limit_configs", () => ({
  strictRateLimit: {},
}));

/** Replace NextResponse.json with a standard Response so we can call .json() */
vi.mock("next/server", () => ({
  NextResponse: {
    json: (body: unknown, init?: ResponseInit) =>
      new Response(JSON.stringify(body), {
        ...init,
        headers: { "Content-Type": "application/json" },
      }),
  },
}));

/** cookies() returns a minimal cookie store – we don't inspect cookies in tests */
vi.mock("next/headers", () => ({
  cookies: vi.fn().mockResolvedValue({}),
}));

/** No real DB connections */
vi.mock("@omenai/shared-lib/mongo_connect/mongoConnect", () => ({
  connectMongoDB: vi.fn().mockResolvedValue(undefined),
}));

/** Mock the Mongoose model – we control what findOne() returns per test */
vi.mock("@omenai/shared-models/models/auth/IndividualSchema", () => ({
  AccountIndividual: {
    findOne: vi.fn(),
  },
}));

/** bcrypt default export – compareSync is the only method the route uses */
vi.mock("bcrypt", () => ({
  default: { compareSync: vi.fn() },
}));

/** Session helpers */
vi.mock("@omenai/shared-lib/auth/session", () => ({
  createSession: vi.fn().mockResolvedValue("mock-session-id"),
  getSessionFromCookie: vi.fn().mockResolvedValue({
    sessionId: null,
    save: vi.fn().mockResolvedValue(undefined),
  }),
}));

/** Soft-delete cleanup – not the focus of login tests */
vi.mock("@omenai/shared-models/models/deletion/DeletionRequestSchema", () => ({
  DeletionRequestModel: {
    deleteOne: vi.fn().mockResolvedValue(undefined),
  },
}));

/** Push-token persistence – only exercised in mobile tests */
vi.mock(
  "@omenai/shared-models/models/device_management/DeviceManagementSchema",
  () => ({
    DeviceManagement: {
      updateOne: vi.fn().mockResolvedValue(undefined),
    },
  }),
);

/** Analytics enrichment – side-effect we don't need to assert on */
vi.mock("@omenai/shared-lib/analytics/extractTrackingData", () => ({
  enrichRegistrationTracking: vi.fn(),
}));

/** Suppress Rollbar error reporting in tests */
vi.mock("@omenai/rollbar-config", () => ({
  rollbarServerInstance: { error: vi.fn() },
}));

/**
 * Mock the api/util barrel:
 *  - validateRequestBody: re-implement the real zod-parsing logic so that
 *    invalid-body tests still return 400 without importing the full util module
 *    (which depends on Stripe, DHL, Rollbar, etc.)
 *  - createErrorRollbarReport: no-op
 */
vi.mock("../../../../app/api/util", () => {
  // Inline BadRequestError so the errorHandler can map it to 400
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

// ─── Route import (after all mocks are registered) ────────────────────────────

import { POST } from "../../../../app/api/auth/individual/login/route";
import { AccountIndividual } from "@omenai/shared-models/models/auth/IndividualSchema";
import bcrypt from "bcrypt";
import {
  createSession,
  getSessionFromCookie,
} from "@omenai/shared-lib/auth/session";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeRequest(
  body: object,
  headers: Record<string, string> = {},
): Request {
  return new Request("http://localhost/api/auth/individual/login", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

/** A realistic user document returned by Mongoose */
const mockUser = {
  user_id: "user-abc-123",
  name: "Test User",
  email: "test@example.com",
  password: "$2b$10$hashedpassword",
  role: "user",
  verified: true,
  preferences: {},
  address: {},
  registration_tracking: {},
};

/**
 * Helper: wire up AccountIndividual.findOne so .select().exec() resolves to `value`.
 */
function mockFindOne(value: typeof mockUser | null) {
  const chain = {
    select: vi.fn().mockReturnThis(),
    exec: vi.fn().mockResolvedValue(value),
  };
  vi.mocked(AccountIndividual.findOne).mockReturnValue(chain as any);
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("POST /api/auth/individual/login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Web (browser) login ────────────────────────────────────────────────────

  describe("web login (browser client)", () => {
    it("returns 200 with session data for valid credentials", async () => {
      mockFindOne(mockUser);
      vi.mocked(bcrypt.compareSync).mockReturnValue(true as never);

      const request = makeRequest({
        email: "test@example.com",
        password: "password123",
      });
      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.message).toBe("Login successful");
      expect(body.data.email).toBe("test@example.com");
      expect(body.data.role).toBe("user");
    });

    it("calls createSession and saves the session cookie", async () => {
      mockFindOne(mockUser);
      vi.mocked(bcrypt.compareSync).mockReturnValue(true as never);
      const mockSave = vi.fn().mockResolvedValue(undefined);
      vi.mocked(getSessionFromCookie).mockResolvedValue({
        sessionId: null,
        save: mockSave,
      } as any);

      await POST(makeRequest({ email: "test@example.com", password: "pw" }));

      expect(createSession).toHaveBeenCalledOnce();
      expect(mockSave).toHaveBeenCalledOnce();
    });

    it("returns 409 when user is not found in the database", async () => {
      mockFindOne(null); // simulate no user record
      vi.mocked(bcrypt.compareSync).mockReturnValue(false as never);

      const response = await POST(
        makeRequest({ email: "ghost@example.com", password: "whatever" }),
      );
      const body = await response.json();

      expect(response.status).toBe(409);
      expect(body.message).toBe("Invalid credentials");
    });

    it("returns 409 when the password does not match", async () => {
      mockFindOne(mockUser);
      vi.mocked(bcrypt.compareSync).mockReturnValue(false as never); // wrong password

      const response = await POST(
        makeRequest({ email: "test@example.com", password: "wrongpassword" }),
      );
      const body = await response.json();

      expect(response.status).toBe(409);
      expect(body.message).toBe("Invalid credentials");
    });

    it("returns 400 when email is missing from the request body", async () => {
      const response = await POST(
        makeRequest({ password: "password123" }), // no email
      );
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

    it("returns 400 when password is missing from the request body", async () => {
      const response = await POST(
        makeRequest({ email: "test@example.com" }), // no password
      );
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.message).toMatch(/Validation Failed/i);
    });
  });

  // ── Mobile app login ───────────────────────────────────────────────────────

  describe("mobile login (mobile app client)", () => {
    const MOBILE_USER_AGENT = "OmenaiApp/1.0";
    const MOBILE_ACCESS_KEY = "test-mobile-key";

    beforeEach(() => {
      process.env.MOBILE_USER_AGENT = MOBILE_USER_AGENT;
      process.env.MOBILE_ACCESS_KEY = MOBILE_ACCESS_KEY;
    });

    it("returns access_token in response body instead of setting a cookie", async () => {
      mockFindOne(mockUser);
      vi.mocked(bcrypt.compareSync).mockReturnValue(true as never);
      vi.mocked(createSession).mockResolvedValue("mobile-session-token");

      const response = await POST(
        makeRequest(
          { email: "test@example.com", password: "password123" },
          {
            "User-Agent": MOBILE_USER_AGENT,
            "X-Access-Key": MOBILE_ACCESS_KEY,
          },
        ),
      );
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.data.access_token).toBe("mobile-session-token");
    });

    it("does NOT call getSessionFromCookie for mobile logins", async () => {
      mockFindOne(mockUser);
      vi.mocked(bcrypt.compareSync).mockReturnValue(true as never);

      await POST(
        makeRequest(
          { email: "test@example.com", password: "password123" },
          {
            "User-Agent": MOBILE_USER_AGENT,
            "X-Access-Key": MOBILE_ACCESS_KEY,
          },
        ),
      );

      expect(getSessionFromCookie).not.toHaveBeenCalled();
    });

    it("returns 403 when X-Access-Key is wrong", async () => {
      mockFindOne(mockUser);
      vi.mocked(bcrypt.compareSync).mockReturnValue(true as never);

      const response = await POST(
        makeRequest(
          { email: "test@example.com", password: "password123" },
          {
            "User-Agent": MOBILE_USER_AGENT,
            "X-Access-Key": "invalid-key",
          },
        ),
      );
      const body = await response.json();

      expect(response.status).toBe(403);
      expect(body.message).toBe("Invalid App Credentials");
    });

    it("returns 403 when X-Access-Key header is absent", async () => {
      mockFindOne(mockUser);
      vi.mocked(bcrypt.compareSync).mockReturnValue(true as never);

      const response = await POST(
        makeRequest(
          { email: "test@example.com", password: "password123" },
          { "User-Agent": MOBILE_USER_AGENT }, // no X-Access-Key
        ),
      );
      const body = await response.json();

      expect(response.status).toBe(403);
    });
  });
});
