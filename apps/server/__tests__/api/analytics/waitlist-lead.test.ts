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
  default: { findOne: vi.fn(), create: vi.fn() },
}));
vi.mock("@omenai/rollbar-config", () => ({
  rollbarServerInstance: { error: vi.fn() },
}));

import { POST } from "../../../app/api/analytics/waitlist-lead/route";
import WaitlistLead from "@omenai/shared-models/models/WaitlistFunnel/WaitlistLeadModel";

function makeRequest(body: object) {
  return new Request("http://localhost/api/analytics/waitlist-lead", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const validPayload = {
  email: "user@example.com",
  name: "Alice",
  country: "France",
  entity: "gallery",
  kpi: "sales",
  marketing: true,
  survey: null,
};

describe("POST /api/analytics/waitlist-lead", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 201 when a new lead is created", async () => {
    vi.mocked(WaitlistLead.findOne).mockReturnValue({ lean: vi.fn().mockResolvedValue(null) } as any);
    vi.mocked(WaitlistLead.create).mockResolvedValue({} as any);

    const response = await POST(makeRequest(validPayload));
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.success).toBe(true);
    expect(body.message).toBe("Welcome to the club!");
  });

  it("returns 200 when the user is already on the waitlist", async () => {
    vi.mocked(WaitlistLead.findOne).mockReturnValue({
      lean: vi.fn().mockResolvedValue({ email: "user@example.com" }),
    } as any);

    const response = await POST(makeRequest(validPayload));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("You are already on the list!");
  });

  it("returns 400 when required fields are missing", async () => {
    const response = await POST(makeRequest({ email: "user@example.com" }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("Missing required fields");
  });

  it("returns 400 when email is missing", async () => {
    const response = await POST(makeRequest({ name: "Alice", entity: "gallery" }));
    const body = await response.json();

    expect(response.status).toBe(400);
  });

  it("creates the lead with correct email and entity", async () => {
    vi.mocked(WaitlistLead.findOne).mockReturnValue({ lean: vi.fn().mockResolvedValue(null) } as any);
    vi.mocked(WaitlistLead.create).mockResolvedValue({} as any);

    await POST(makeRequest(validPayload));

    expect(WaitlistLead.findOne).toHaveBeenCalledWith({
      email: "user@example.com",
      entity: "gallery",
    });
    expect(WaitlistLead.create).toHaveBeenCalledOnce();
  });
});
