import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@omenai/shared-lib/mongo_connect/mongoConnect", () => ({
  connectMongoDB: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("@omenai/shared-models/models/WaitlistFunnel/WaitlistLeadModel", () => ({
  default: { insertMany: vi.fn().mockResolvedValue([]) },
}));
vi.mock("@omenai/shared-models/models/WaitlistFunnel/CampaignVisitsModel", () => ({
  default: { insertMany: vi.fn().mockResolvedValue([]) },
}));
vi.mock("@omenai/shared-lib/mock/generateMockData", () => ({
  generateMockData: vi.fn().mockReturnValue([{ email: "mock@test.com" }, { email: "mock2@test.com" }]),
  seedVisits: vi.fn().mockReturnValue([{ visitorId: "v-1" }]),
}));

import { POST } from "../../../app/api/analytics/create-waitlist-lead/route";
import WaitlistLead from "@omenai/shared-models/models/WaitlistFunnel/WaitlistLeadModel";
import CampaignVisit from "@omenai/shared-models/models/WaitlistFunnel/CampaignVisitsModel";

function makeRequest() {
  return new Request("http://localhost/api/analytics/create-waitlist-lead", {
    method: "POST",
  });
}

describe("POST /api/analytics/create-waitlist-lead", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 200 with mock data count on success", async () => {
    const response = await POST(makeRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Mock data generated successfully");
    expect(body.count).toBe(2);
  });

  it("inserts mock leads and visits into the database", async () => {
    await POST(makeRequest());

    expect(WaitlistLead.insertMany).toHaveBeenCalledOnce();
    expect(CampaignVisit.insertMany).toHaveBeenCalledOnce();
  });

  it("returns 500 when insertMany fails", async () => {
    vi.mocked(WaitlistLead.insertMany).mockRejectedValue(new Error("DB error"));

    const response = await POST(makeRequest());
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toBe("Failed to generate mock data");
  });
});
