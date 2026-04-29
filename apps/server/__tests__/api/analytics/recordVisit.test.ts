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

vi.mock("@omenai/shared-models/models/WaitlistFunnel/CampaignVisitsModel", () => ({
  default: { create: vi.fn() },
}));

vi.mock("ua-parser-js", () => ({
  UAParser: vi.fn().mockImplementation(() => ({
    getResult: vi.fn().mockReturnValue({
      device: { type: "mobile", vendor: "Apple", model: "iPhone" },
      os: { name: "iOS", version: "16.0" },
      browser: { name: "Safari" },
    }),
  })),
}));

import { POST } from "../../../app/api/analytics/record-visit/route";
import CampaignVisit from "@omenai/shared-models/models/WaitlistFunnel/CampaignVisitsModel";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";

function makeRequest(
  body: Record<string, any> = {},
  headers: Record<string, string> = {},
): Request {
  return new Request("http://localhost/api/analytics/record-visit", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

const visitBody = {
  source: "google",
  medium: "cpc",
  campaign: "summer-launch",
  referrer: "https://google.com",
  visitorId: "visitor-uuid-123",
};

describe("POST /api/analytics/record-visit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(CampaignVisit.create).mockResolvedValue({} as any);
  });

  it("returns 200 with success:true on valid visit", async () => {
    const response = await POST(makeRequest(visitBody));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
  });

  it("passes visitorId and UTM params to CampaignVisit.create", async () => {
    await POST(makeRequest(visitBody));

    expect(CampaignVisit.create).toHaveBeenCalledWith(
      expect.objectContaining({
        visitorId: "visitor-uuid-123",
        source: "google",
        medium: "cpc",
        campaign: "summer-launch",
        referrer: "https://google.com",
      }),
    );
  });

  it("reads country from x-vercel-ip-country header", async () => {
    await POST(makeRequest(visitBody, { "x-vercel-ip-country": "NG" }));

    expect(CampaignVisit.create).toHaveBeenCalledWith(
      expect.objectContaining({ country: "NG" }),
    );
  });

  it("defaults source to direct and medium to none when not provided", async () => {
    await POST(makeRequest({ visitorId: "v-1" }));

    expect(CampaignVisit.create).toHaveBeenCalledWith(
      expect.objectContaining({ source: "direct", medium: "none" }),
    );
  });

  it("includes browser info parsed by UAParser", async () => {
    await POST(makeRequest(visitBody));

    expect(CampaignVisit.create).toHaveBeenCalledWith(
      expect.objectContaining({
        browser: { name: "Safari" },
        os: { name: "iOS", version: "16.0" },
      }),
    );
  });

  it("returns 500 when CampaignVisit.create throws", async () => {
    vi.mocked(CampaignVisit.create).mockRejectedValue(new Error("DB error"));

    const response = await POST(makeRequest(visitBody));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.success).toBe(false);
  });

  it("returns 500 when connectMongoDB throws", async () => {
    vi.mocked(connectMongoDB).mockRejectedValueOnce(new Error("Connection failed"));

    const response = await POST(makeRequest(visitBody));

    expect(response.status).toBe(500);
  });
});
