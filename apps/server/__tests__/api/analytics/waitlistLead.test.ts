import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@omenai/shared-lib/auth/middleware/rate_limit_middleware", () => ({
  withRateLimit: () => (fn: any) => fn,
}));

vi.mock("@omenai/shared-lib/auth/configs/rate_limit_configs", () => ({
  standardRateLimit: {},
}));

vi.mock("@omenai/shared-lib/mongo_connect/mongoConnect", () => ({
  connectMongoDB: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@omenai/shared-models/models/WaitlistFunnel/WaitlistLeadModel", () => ({
  default: {
    findOne: vi.fn(),
    create: vi.fn(),
  },
}));

vi.mock("@omenai/rollbar-config", () => ({
  rollbarServerInstance: { error: vi.fn() },
}));

vi.mock("ua-parser-js", () => ({
  UAParser: vi.fn().mockImplementation(() => ({
    getResult: vi.fn().mockReturnValue({
      device: { type: "desktop", vendor: "Dell", model: "XPS" },
      os: { name: "Windows", version: "11" },
      browser: { name: "Chrome" },
    }),
  })),
}));

import { POST } from "../../../app/api/analytics/waitlist-lead/route";
import WaitlistLead from "@omenai/shared-models/models/WaitlistFunnel/WaitlistLeadModel";

const validBody = {
  email: "ada@test.com",
  name: "Ada Okonkwo",
  country: "NG",
  entity: "collector",
  kpi: "discover",
  marketing: true,
  survey: { art_discovery_or_share_method: "Social Media" },
};

function makeRequest(body: Record<string, any> = {}): Request {
  return new Request("http://localhost/api/analytics/waitlist-lead", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/analytics/waitlist-lead", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(WaitlistLead.findOne).mockReturnValue({
      lean: vi.fn().mockResolvedValue(null),
    } as any);
    vi.mocked(WaitlistLead.create).mockResolvedValue({} as any);
  });

  it("returns 201 with success message when new user is added", async () => {
    const response = await POST(makeRequest(validBody));
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.success).toBe(true);
    expect(body.message).toBe("Welcome to the club!");
  });

  it("calls WaitlistLead.create with email, name, entity, and device info", async () => {
    await POST(makeRequest(validBody));

    expect(WaitlistLead.create).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "ada@test.com",
        name: "Ada Okonkwo",
        entity: "collector",
        country: "NG",
        browser: { name: "Chrome" },
        os: { name: "Windows", version: "11" },
      }),
    );
  });

  it("returns 400 when email is missing", async () => {
    const { email: _email, ...noEmail } = validBody;
    const response = await POST(makeRequest(noEmail));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("Missing required fields");
  });

  it("returns 400 when name is missing", async () => {
    const { name: _name, ...noName } = validBody;
    const response = await POST(makeRequest(noName));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("Missing required fields");
  });

  it("returns 400 when entity is missing", async () => {
    const { entity: _entity, ...noEntity } = validBody;
    const response = await POST(makeRequest(noEntity));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("Missing required fields");
  });

  it("returns 200 with already-on-list message when user exists", async () => {
    vi.mocked(WaitlistLead.findOne).mockReturnValue({
      lean: vi.fn().mockResolvedValue({ email: "ada@test.com", entity: "collector" }),
    } as any);

    const response = await POST(makeRequest(validBody));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("You are already on the list!");
    expect(WaitlistLead.create).not.toHaveBeenCalled();
  });

  it("checks for existing user by email and entity", async () => {
    await POST(makeRequest(validBody));

    expect(WaitlistLead.findOne).toHaveBeenCalledWith({
      email: "ada@test.com",
      entity: "collector",
    });
  });

  it("returns 500 when WaitlistLead.create throws", async () => {
    vi.mocked(WaitlistLead.create).mockRejectedValue(new Error("DB error"));

    const response = await POST(makeRequest(validBody));

    expect(response.status).toBe(500);
  });
});
