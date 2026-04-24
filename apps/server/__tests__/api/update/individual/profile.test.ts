import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@omenai/shared-lib/auth/middleware/combined_middleware", () => ({
  withRateLimitHighlightAndCsrf: () => (fn: any) => fn,
}));

vi.mock("@omenai/shared-lib/auth/configs/rate_limit_configs", () => ({
  strictRateLimit: {},
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

vi.mock("@omenai/shared-lib/mongo_connect/mongoConnect", () => ({
  connectMongoDB: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@omenai/rollbar-config", () => ({
  rollbarServerInstance: { error: vi.fn() },
}));

vi.mock("@omenai/shared-models/models/auth/IndividualSchema", () => ({
  AccountIndividual: { updateOne: vi.fn() },
}));

vi.mock("@omenai/url-config/src/config", () => ({
  getApiUrl: vi.fn().mockReturnValue("http://localhost"),
}));

vi.mock("country-state-city", () => ({
  Country: { getAllCountries: vi.fn().mockReturnValue([]) },
}));

vi.mock("../../../../app/api/util", () => ({
  createErrorRollbarReport: vi.fn(),
}));

import { POST } from "../../../../app/api/update/individual/profile/route";
import { AccountIndividual } from "@omenai/shared-models/models/auth/IndividualSchema";

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/update/individual/profile", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/update/individual/profile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(AccountIndividual.updateOne).mockResolvedValue({ modifiedCount: 1 } as any);
  });

  it("returns 200 when profile updated successfully", async () => {
    const response = await POST(makeRequest({ id: "user-1", name: "John Updated", phone: "+1234567890" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Profile data updated");
    expect(AccountIndividual.updateOne).toHaveBeenCalledWith(
      { user_id: "user-1" },
      { $set: expect.objectContaining({ id: "user-1", name: "John Updated" }) },
    );
  });

  it("returns 200 when updating partial fields", async () => {
    const response = await POST(makeRequest({ id: "user-2", phone: "+9876543210" }));
    const body = await response.json();

    expect(response.status).toBe(200);
  });
});
