import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@omenai/shared-lib/auth/middleware/combined_middleware", () => ({
  withRateLimitHighlightAndCsrf: () => (fn: any) => fn,
}));

vi.mock("@omenai/shared-lib/auth/configs/rate_limit_configs", () => ({
  strictRateLimit: {},
}));

vi.mock("@omenai/shared-lib/mongo_connect/mongoConnect", () => ({
  connectMongoDB: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@omenai/shared-models/models/auth/IndividualSchema", () => ({
  AccountIndividual: { updateOne: vi.fn() },
}));

vi.mock("@omenai/url-config/src/config", () => ({
  getApiUrl: vi.fn().mockReturnValue("http://localhost"),
}));

vi.mock("../../../../app/api/util", async () => {
  const { buildValidateRequestBodyMock } = await import("../../../helpers/util-mock");
  return buildValidateRequestBodyMock();
});

import { POST } from "../../../../app/api/update/individual/address/route";
import { AccountIndividual } from "@omenai/shared-models/models/auth/IndividualSchema";
import { validateDHLAddress } from "../../../../app/api/util";

const usAddress = {
  address_line: "100 Main St",
  city: "New York",
  country: "US",
  countryCode: "US",
  state: "NY",
  stateCode: "NY",
  zip: "10001",
};

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/update/individual/address", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/update/individual/address", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(validateDHLAddress).mockResolvedValue(undefined);
    vi.mocked(AccountIndividual.updateOne).mockResolvedValue({ modifiedCount: 1 } as any);
  });

  it("returns 200 when address updated successfully", async () => {
    const response = await POST(makeRequest({ user_id: "user-1", address: usAddress }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Address information updated successfully");
    expect(validateDHLAddress).toHaveBeenCalledWith(
      expect.objectContaining({ type: "delivery", countryCode: "US" }),
    );
    expect(AccountIndividual.updateOne).toHaveBeenCalledWith(
      { user_id: "user-1" },
      { $set: { address: usAddress } },
    );
  });

  it("returns 500 when DHL address validation fails", async () => {
    vi.mocked(validateDHLAddress).mockRejectedValue(new Error("Cannot ship there"));

    const response = await POST(makeRequest({ user_id: "user-1", address: usAddress }));

    expect(response.status).toBe(500);
  });

  it("returns 400 when user_id is missing", async () => {
    const response = await POST(makeRequest({ address: usAddress }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });

  it("returns 400 when address is missing", async () => {
    const response = await POST(makeRequest({ user_id: "user-1" }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });
});
