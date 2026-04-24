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

vi.mock("@omenai/shared-models/models/auth/GallerySchema", () => ({
  AccountGallery: {
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

vi.mock("@omenai/shared-models/models/deletion/DeletionRequestSchema", () => ({
  DeletionRequestModel: {
    deleteOne: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock(
  "@omenai/shared-models/models/device_management/DeviceManagementSchema",
  () => ({
    DeviceManagement: {
      updateOne: vi.fn().mockResolvedValue(undefined),
    },
  }),
);

vi.mock("@omenai/shared-lib/analytics/extractTrackingData", () => ({
  enrichRegistrationTracking: vi.fn(),
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

import { POST } from "../../../../app/api/auth/gallery/login/route";
import { AccountGallery } from "@omenai/shared-models/models/auth/GallerySchema";
import bcrypt from "bcrypt";
import {
  createSession,
  getSessionFromCookie,
} from "@omenai/shared-lib/auth/session";

function makeRequest(
  body: object,
  headers: Record<string, string> = {},
): Request {
  return new Request("http://localhost/api/auth/gallery/login", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

const mockGallery = {
  gallery_id: "gallery-abc-123",
  name: "Test Gallery",
  email: "gallery@example.com",
  password: "$2b$10$hashedpassword",
  role: "gallery",
  verified: true,
  admin: "Admin Name",
  description: "A test gallery",
  address: {},
  gallery_verified: false,
  logo: "https://example.com/logo.png",
  subscription_status: "inactive",
  connected_account_id: "acct-xyz",
  status: "active",
  stripe_customer_id: "cus-xyz",
};

function mockFindOne(value: typeof mockGallery | null) {
  const chain = {
    exec: vi.fn().mockResolvedValue(value),
  };
  vi.mocked(AccountGallery.findOne).mockReturnValue(chain as any);
}

describe("POST /api/auth/gallery/login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("web login", () => {
    it("returns 200 with session data for valid credentials", async () => {
      mockFindOne(mockGallery);
      vi.mocked(bcrypt.compareSync).mockReturnValue(true as never);

      const response = await POST(
        makeRequest({ email: "gallery@example.com", password: "password123" }),
      );
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.message).toBe("Login successful");
      expect(body.data.email).toBe("gallery@example.com");
      expect(body.data.role).toBe("gallery");
    });

    it("calls createSession and saves the session cookie", async () => {
      mockFindOne(mockGallery);
      vi.mocked(bcrypt.compareSync).mockReturnValue(true as never);
      const mockSave = vi.fn().mockResolvedValue(undefined);
      vi.mocked(getSessionFromCookie).mockResolvedValue({
        sessionId: null,
        save: mockSave,
      } as any);

      await POST(
        makeRequest({ email: "gallery@example.com", password: "password123" }),
      );

      expect(createSession).toHaveBeenCalledOnce();
      expect(mockSave).toHaveBeenCalledOnce();
    });

    it("returns 409 when gallery is not found", async () => {
      mockFindOne(null);
      vi.mocked(bcrypt.compareSync).mockReturnValue(false as never);

      const response = await POST(
        makeRequest({ email: "ghost@example.com", password: "whatever" }),
      );
      const body = await response.json();

      expect(response.status).toBe(409);
      expect(body.message).toBe("Invalid credentials");
    });

    it("returns 409 when password does not match", async () => {
      mockFindOne(mockGallery);
      vi.mocked(bcrypt.compareSync).mockReturnValue(false as never);

      const response = await POST(
        makeRequest({
          email: "gallery@example.com",
          password: "wrongpassword",
        }),
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
      const response = await POST(
        makeRequest({ email: "gallery@example.com" }),
      );
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.message).toMatch(/Validation Failed/i);
    });
  });

  describe("mobile login", () => {
    const MOBILE_USER_AGENT = "OmenaiApp/1.0";
    const MOBILE_ACCESS_KEY = "test-mobile-key";

    beforeEach(() => {
      process.env.MOBILE_USER_AGENT = MOBILE_USER_AGENT;
      process.env.MOBILE_ACCESS_KEY = MOBILE_ACCESS_KEY;
    });

    it("returns access_token in response body instead of a cookie", async () => {
      mockFindOne(mockGallery);
      vi.mocked(bcrypt.compareSync).mockReturnValue(true as never);
      vi.mocked(createSession).mockResolvedValue("mobile-session-token");

      const response = await POST(
        makeRequest(
          { email: "gallery@example.com", password: "password123" },
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

    it("does not call getSessionFromCookie for mobile logins", async () => {
      mockFindOne(mockGallery);
      vi.mocked(bcrypt.compareSync).mockReturnValue(true as never);

      await POST(
        makeRequest(
          { email: "gallery@example.com", password: "password123" },
          {
            "User-Agent": MOBILE_USER_AGENT,
            "X-Access-Key": MOBILE_ACCESS_KEY,
          },
        ),
      );

      expect(getSessionFromCookie).not.toHaveBeenCalled();
    });

    it("updates device push token when device_push_token is provided", async () => {
      const { DeviceManagement } = await import(
        "@omenai/shared-models/models/device_management/DeviceManagementSchema"
      );
      mockFindOne(mockGallery);
      vi.mocked(bcrypt.compareSync).mockReturnValue(true as never);

      await POST(
        makeRequest(
          {
            email: "gallery@example.com",
            password: "password123",
            device_push_token: "device-token-xyz",
          },
          {
            "User-Agent": MOBILE_USER_AGENT,
            "X-Access-Key": MOBILE_ACCESS_KEY,
          },
        ),
      );

      expect(DeviceManagement.updateOne).toHaveBeenCalledWith(
        { auth_id: mockGallery.gallery_id },
        { $set: { device_push_token: "device-token-xyz" } },
        { upsert: true },
      );
    });

    it("returns 403 when X-Access-Key is wrong", async () => {
      mockFindOne(mockGallery);
      vi.mocked(bcrypt.compareSync).mockReturnValue(true as never);

      const response = await POST(
        makeRequest(
          { email: "gallery@example.com", password: "password123" },
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
      mockFindOne(mockGallery);
      vi.mocked(bcrypt.compareSync).mockReturnValue(true as never);

      const response = await POST(
        makeRequest(
          { email: "gallery@example.com", password: "password123" },
          { "User-Agent": MOBILE_USER_AGENT },
        ),
      );

      expect(response.status).toBe(403);
    });
  });
});
