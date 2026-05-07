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
  default: { create: vi.fn().mockResolvedValue({}) },
}));

import { POST } from "../../../app/api/analytics/record-visit/route";
import CampaignVisit from "@omenai/shared-models/models/WaitlistFunnel/CampaignVisitsModel";

function makeRequest(body: object, headers: Record<string, string> = {}) {
  return new Request("http://localhost/api/analytics/record-visit", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

const visitPayload = {
  source: "google",
  medium: "cpc",
  campaign: "spring-sale",
  referrer: "https://google.com",
  visitorId: "visitor-uuid-123",
};

describe("POST /api/analytics/record-visit", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 200 on successful visit recording", async () => {
    const response = await POST(makeRequest(visitPayload));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
  });

  it("creates a CampaignVisit record with the visit data", async () => {
    await POST(makeRequest(visitPayload));

    expect(CampaignVisit.create).toHaveBeenCalledOnce();
    const callArg = vi.mocked(CampaignVisit.create).mock.calls[0][0] as any;
    expect(callArg.visitorId).toBe("visitor-uuid-123");
    expect(callArg.source).toBe("google");
    expect(callArg.campaign).toBe("spring-sale");
  });

  it("uses direct as default when source is missing", async () => {
    const { source, ...rest } = visitPayload;
    await POST(makeRequest(rest));

    const callArg = vi.mocked(CampaignVisit.create).mock.calls[0][0] as any;
    expect(callArg.source).toBe("direct");
  });

  it("uses none as default when medium is missing", async () => {
    const { medium, ...rest } = visitPayload;
    await POST(makeRequest(rest));

    const callArg = vi.mocked(CampaignVisit.create).mock.calls[0][0] as any;
    expect(callArg.medium).toBe("none");
  });

  it("reads country from x-vercel-ip-country header", async () => {
    await POST(makeRequest(visitPayload, { "x-vercel-ip-country": "FR" }));

    const callArg = vi.mocked(CampaignVisit.create).mock.calls[0][0] as any;
    expect(callArg.country).toBe("FR");
  });

  it("returns 500 when create throws", async () => {
    vi.mocked(CampaignVisit.create).mockRejectedValue(new Error("DB error"));

    const response = await POST(makeRequest(visitPayload));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.success).toBe(false);
  });
});
