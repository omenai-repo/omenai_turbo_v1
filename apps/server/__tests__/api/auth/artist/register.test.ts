import { describe, it, expect, vi, beforeEach } from "vitest";

// mocks must be declared before the route import

vi.mock("@omenai/shared-lib/auth/middleware/rate_limit_middleware", () => ({
  withRateLimit: () => (fn: any) => fn,
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

vi.mock("next/headers", () => ({
  cookies: vi.fn().mockResolvedValue({}),
}));

vi.mock("@omenai/shared-lib/mongo_connect/mongoConnect", () => ({
  connectMongoDB: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@omenai/shared-models/models/auth/ArtistSchema", () => ({
  AccountArtist: {
    findOne: vi.fn(),
    create: vi.fn(),
  },
}));

vi.mock(
  "@omenai/shared-models/models/auth/verification/codeTimeoutSchema",
  () => ({
    VerificationCodes: {
      create: vi.fn(),
    },
  }),
);

vi.mock(
  "@omenai/shared-models/models/device_management/DeviceManagementSchema",
  () => ({
    DeviceManagement: {
      create: vi.fn().mockResolvedValue(undefined),
    },
  }),
);

vi.mock("@omenai/shared-models/models/auth/WaitlistSchema", () => ({
  Waitlist: {
    findOne: vi.fn(),
  },
}));

vi.mock("@omenai/shared-lib/auth/parseRegisterData", () => ({
  parseRegisterData: vi.fn().mockImplementation(async (data: any) => ({
    ...data,
    password: "$2b$10$hashedpassword",
  })),
}));

vi.mock("@omenai/shared-utils/src/generateToken", () => ({
  generateDigit: vi.fn().mockReturnValue("1234567"),
}));

vi.mock(
  "@omenai/shared-emails/src/models/artist/sendArtistSignupMail",
  () => ({
    sendArtistSignupMail: vi.fn().mockResolvedValue(undefined),
  }),
);

vi.mock("@omenai/shared-lib/configcat/configCatFetch", () => ({
  fetchConfigCatValue: vi.fn().mockResolvedValue(true),
}));

vi.mock("@omenai/shared-lib/analytics/extractTrackingData", () => ({
  extractUserTrackingData: vi.fn().mockReturnValue({}),
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

import { POST } from "../../../../app/api/auth/artist/register/route";
import { AccountArtist } from "@omenai/shared-models/models/auth/ArtistSchema";
import { VerificationCodes } from "@omenai/shared-models/models/auth/verification/codeTimeoutSchema";
import { DeviceManagement } from "@omenai/shared-models/models/device_management/DeviceManagementSchema";
import { fetchConfigCatValue } from "@omenai/shared-lib/configcat/configCatFetch";

const validBody = {
  name: "Test Artist",
  email: "artist@example.com",
  password: "password123",
  phone: "+1234567890",
  art_style: "Abstract",
  address: {
    address_line: "123 Art St",
    city: "New York",
    country: "United States",
    countryCode: "US",
    state: "New York",
    stateCode: "NY",
    zip: "10001",
  },
  logo: "https://example.com/logo.png",
  base_currency: "USD",
};

const mockCreatedArtist = {
  artist_id: "artist-abc-123",
  name: "Test Artist",
  email: "artist@example.com",
};

function makeRequest(
  body: object,
  headers: Record<string, string> = {},
): Request {
  return new Request("http://localhost/api/auth/artist/register", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

function mockFindOne(value: object | null) {
  const chain = {
    exec: vi.fn().mockResolvedValue(value),
  };
  vi.mocked(AccountArtist.findOne).mockReturnValue(chain as any);
}

describe("POST /api/auth/artist/register", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(fetchConfigCatValue).mockResolvedValue(true);
    mockFindOne(null);
    vi.mocked(AccountArtist.create).mockResolvedValue(
      mockCreatedArtist as any,
    );
    vi.mocked(VerificationCodes.create).mockResolvedValue({
      code: "1234567",
      author: "artist-abc-123",
    } as any);
  });

  it("returns 201 with artist_id when registration succeeds", async () => {
    const response = await POST(makeRequest(validBody));
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.message).toBe("Artist successfully registered");
    expect(body.data).toBe("artist-abc-123");
  });

  it("returns 409 when the account already exists", async () => {
    mockFindOne({ email: "artist@example.com" });

    const response = await POST(makeRequest(validBody));
    const body = await response.json();

    expect(response.status).toBe(409);
    expect(body.message).toBe("Account already exists, please login");
  });

  it("returns 500 when AccountArtist.create returns a falsy value", async () => {
    vi.mocked(AccountArtist.create).mockResolvedValue(null as any);

    const response = await POST(makeRequest(validBody));
    const body = await response.json();

    expect(response.status).toBe(500);
  });

  it("returns 500 when VerificationCodes.create returns a falsy value", async () => {
    vi.mocked(VerificationCodes.create).mockResolvedValue(null as any);

    const response = await POST(makeRequest(validBody));
    const body = await response.json();

    expect(response.status).toBe(500);
  });

  it("returns 503 when artist onboarding is disabled", async () => {
    vi.mocked(fetchConfigCatValue).mockResolvedValue(false);

    const response = await POST(makeRequest(validBody));
    const body = await response.json();

    expect(response.status).toBe(503);
  });

  it("returns 400 when a required field is missing", async () => {
    const { name: _name, ...bodyWithoutName } = validBody;

    const response = await POST(makeRequest(bodyWithoutName));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });

  it("returns 400 when email format is invalid", async () => {
    const response = await POST(
      makeRequest({ ...validBody, email: "not-an-email" }),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });

  describe("mobile registration", () => {
    const MOBILE_USER_AGENT = "OmenaiApp/1.0";
    const APP_AUTHORIZATION_SECRET = "test-app-secret";

    beforeEach(() => {
      process.env.MOBILE_USER_AGENT = MOBILE_USER_AGENT;
      process.env.APP_AUTHORIZATION_SECRET = APP_AUTHORIZATION_SECRET;
    });

    it("creates a DeviceManagement record when mobile headers and device_push_token are present", async () => {
      const mobileBody = { ...validBody, device_push_token: "device-token-xyz" };

      await POST(
        makeRequest(mobileBody, {
          "User-Agent": MOBILE_USER_AGENT,
          Authorization: APP_AUTHORIZATION_SECRET,
        }),
      );

      expect(DeviceManagement.create).toHaveBeenCalledWith({
        device_push_token: "device-token-xyz",
        auth_id: "artist-abc-123",
      });
    });

    it("does not create a DeviceManagement record when Authorization header is wrong", async () => {
      const mobileBody = { ...validBody, device_push_token: "device-token-xyz" };

      await POST(
        makeRequest(mobileBody, {
          "User-Agent": MOBILE_USER_AGENT,
          Authorization: "wrong-secret",
        }),
      );

      expect(DeviceManagement.create).not.toHaveBeenCalled();
    });

    it("does not create a DeviceManagement record when device_push_token is absent", async () => {
      await POST(
        makeRequest(validBody, {
          "User-Agent": MOBILE_USER_AGENT,
          Authorization: APP_AUTHORIZATION_SECRET,
        }),
      );

      expect(DeviceManagement.create).not.toHaveBeenCalled();
    });
  });
});
