import { describe, it, expect, vi, beforeEach } from "vitest";

// mocks must be declared before the route import

vi.mock("@omenai/shared-lib/auth/middleware/combined_middleware", () => ({
  withRateLimitHighlightAndCsrf: () => (fn: any) => fn,
}));

vi.mock("@omenai/shared-lib/auth/configs/rate_limit_configs", () => ({
  strictRateLimit: {},
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
    create: vi.fn(),
  },
}));

vi.mock("@omenai/shared-models/models/auth/RejectedGalleryScema", () => ({
  RejectedGallery: {
    findOne: vi.fn(),
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

vi.mock("@omenai/shared-lib/auth/parseRegisterData", () => ({
  parseRegisterData: vi.fn().mockImplementation(async (data: any) => ({
    ...data,
    password: "$2b$10$hashedpassword",
  })),
}));

vi.mock("@omenai/shared-utils/src/generateToken", () => ({
  generateDigit: vi.fn().mockReturnValue("1234567"),
}));

vi.mock("@omenai/shared-emails/src/models/gallery/sendGalleryMail", () => ({
  sendGalleryMail: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@omenai/shared-lib/configcat/configCatFetch", () => ({
  fetchConfigCatValue: vi.fn().mockResolvedValue(true),
}));

vi.mock("@omenai/shared-lib/analytics/extractTrackingData", () => ({
  extractUserTrackingData: vi.fn().mockReturnValue({}),
}));

vi.mock("../../../../app/api/util", async () => {
  const { buildValidateRequestBodyMock } = await import("../../../helpers/util-mock");
  return buildValidateRequestBodyMock();
});

import { POST } from "../../../../app/api/auth/gallery/register/route";
import { AccountGallery } from "@omenai/shared-models/models/auth/GallerySchema";
import { RejectedGallery } from "@omenai/shared-models/models/auth/RejectedGalleryScema";
import { VerificationCodes } from "@omenai/shared-models/models/auth/verification/codeTimeoutSchema";
import { DeviceManagement } from "@omenai/shared-models/models/device_management/DeviceManagementSchema";
import { fetchConfigCatValue } from "@omenai/shared-lib/configcat/configCatFetch";

const validBody = {
  name: "Test Gallery",
  email: "gallery@example.com",
  password: "password123",
  phone: "+1234567890",
  address: {
    address_line: "123 Gallery St",
    city: "New York",
    country: "United States",
    countryCode: "US",
    state: "New York",
    stateCode: "NY",
    zip: "10001",
  },
  logo: "https://example.com/logo.png",
  admin: "Admin Name",
  description: "A wonderful gallery",
};

const mockCreatedGallery = {
  gallery_id: "gallery-abc-123",
  name: "Test Gallery",
  email: "gallery@example.com",
};

function makeRequest(
  body: object,
  headers: Record<string, string> = {},
): Request {
  return new Request("http://localhost/api/auth/gallery/register", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

function mockFindOne(model: { findOne: ReturnType<typeof vi.fn> }, value: object | null) {
  const chain = {
    exec: vi.fn().mockResolvedValue(value),
  };
  vi.mocked(model.findOne).mockReturnValue(chain as any);
}

describe("POST /api/auth/gallery/register", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(fetchConfigCatValue).mockResolvedValue(true);
    mockFindOne(AccountGallery, null);
    mockFindOne(RejectedGallery, null);
    vi.mocked(AccountGallery.create).mockResolvedValue(
      mockCreatedGallery as any,
    );
    vi.mocked(VerificationCodes.create).mockResolvedValue({
      code: "1234567",
      author: "gallery-abc-123",
    } as any);
  });

  it("returns 201 with gallery_id when registration succeeds", async () => {
    const response = await POST(makeRequest(validBody));
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.message).toBe("Account successfully registered");
    expect(body.data).toBe("gallery-abc-123");
  });

  it("returns 409 when the account already exists", async () => {
    mockFindOne(AccountGallery, { email: "gallery@example.com" });

    const response = await POST(makeRequest(validBody));
    const body = await response.json();

    expect(response.status).toBe(409);
    expect(body.message).toBe("Account already exists, please login");
  });

  it("returns 409 when the account has been rejected", async () => {
    mockFindOne(RejectedGallery, { email: "gallery@example.com" });

    const response = await POST(makeRequest(validBody));
    const body = await response.json();

    expect(response.status).toBe(409);
    expect(body.message).toMatch(/cannot create an account/i);
  });

  it("returns 500 when AccountGallery.create returns a falsy value", async () => {
    vi.mocked(AccountGallery.create).mockResolvedValue(null as any);

    const response = await POST(makeRequest(validBody));

    expect(response.status).toBe(500);
  });

  it("returns 500 when VerificationCodes.create returns a falsy value", async () => {
    vi.mocked(VerificationCodes.create).mockResolvedValue(null as any);

    const response = await POST(makeRequest(validBody));

    expect(response.status).toBe(500);
  });

  it("returns 503 when gallery onboarding is disabled", async () => {
    vi.mocked(fetchConfigCatValue).mockResolvedValue(false);

    const response = await POST(makeRequest(validBody));

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
        auth_id: "gallery-abc-123",
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
