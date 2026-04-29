import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@omenai/shared-lib/mongo_connect/mongoConnect", () => ({
  connectMongoDB: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@omenai/shared-models/models/WaitlistFunnel/WaitlistLeadModel", () => ({
  default: { insertMany: vi.fn() },
}));

vi.mock("@omenai/shared-models/models/WaitlistFunnel/CampaignVisitsModel", () => ({
  default: { insertMany: vi.fn() },
}));

vi.mock("@omenai/shared-lib/mock/generateMockData", () => ({
  generateMockData: vi.fn().mockReturnValue([{ id: "lead-1" }, { id: "lead-2" }, { id: "lead-3" }]),
  seedVisits: vi.fn().mockReturnValue([{ id: "visit-1" }, { id: "visit-2" }]),
}));

import { POST } from "../../../app/api/analytics/create-waitlist-lead/route";
import WaitlistLead from "@omenai/shared-models/models/WaitlistFunnel/WaitlistLeadModel";
import CampaignVisit from "@omenai/shared-models/models/WaitlistFunnel/CampaignVisitsModel";
import { generateMockData, seedVisits } from "@omenai/shared-lib/mock/generateMockData";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";

describe("POST /api/analytics/create-waitlist-lead", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(WaitlistLead.insertMany).mockResolvedValue([] as any);
    vi.mocked(CampaignVisit.insertMany).mockResolvedValue([] as any);
    vi.mocked(generateMockData).mockReturnValue([{ id: "lead-1" }, { id: "lead-2" }, { id: "lead-3" }] as any);
    vi.mocked(seedVisits).mockReturnValue([{ id: "visit-1" }, { id: "visit-2" }] as any);
  });

  it("returns 200 with success message and count", async () => {
    const req = new Request("http://localhost/api/analytics/create-waitlist-lead", {
      method: "POST",
    });
    const response = await POST(req);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Mock data generated successfully");
    expect(body.count).toBe(3);
  });

  it("calls WaitlistLead.insertMany with generated mock data", async () => {
    const req = new Request("http://localhost/api/analytics/create-waitlist-lead", {
      method: "POST",
    });
    await POST(req);

    expect(WaitlistLead.insertMany).toHaveBeenCalledWith(
      expect.arrayContaining([{ id: "lead-1" }]),
    );
  });

  it("calls CampaignVisit.insertMany with seeded visits", async () => {
    const req = new Request("http://localhost/api/analytics/create-waitlist-lead", {
      method: "POST",
    });
    await POST(req);

    expect(CampaignVisit.insertMany).toHaveBeenCalledWith(
      expect.arrayContaining([{ id: "visit-1" }]),
    );
  });

  it("returns 500 when WaitlistLead.insertMany throws", async () => {
    vi.mocked(WaitlistLead.insertMany).mockRejectedValue(new Error("DB error"));

    const req = new Request("http://localhost/api/analytics/create-waitlist-lead", {
      method: "POST",
    });
    const response = await POST(req);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toBe("Failed to generate mock data");
  });

  it("returns 500 when connectMongoDB throws", async () => {
    vi.mocked(connectMongoDB).mockRejectedValueOnce(new Error("Connection failed"));

    const req = new Request("http://localhost/api/analytics/create-waitlist-lead", {
      method: "POST",
    });
    const response = await POST(req);

    expect(response.status).toBe(500);
  });
});
