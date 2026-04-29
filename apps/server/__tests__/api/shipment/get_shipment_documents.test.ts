import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@omenai/shared-lib/auth/middleware/combined_middleware", () => ({
  withRateLimitHighlightAndCsrf: () => (fn: any) => fn,
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
  NextRequest: class NextRequest extends Request {
    nextUrl: URL;
    constructor(input: RequestInfo | URL, init?: RequestInit) {
      super(input as RequestInfo, init);
      this.nextUrl = new URL(
        typeof input === "string" ? input : (input as Request).url,
      );
    }
  },
}));

vi.mock("../../../app/api/shipment/resources", () => ({
  getDhlHeaders: vi.fn().mockReturnValue(new Headers()),
  OMENAI_INC_DHL_EXPRESS_IMPORT_ACCOUNT: "TEST_ACCOUNT",
  DHL_API: "https://express.api.dhl.com/mydhlapi/test",
}));

vi.mock("../../../app/api/util", () => ({
  createErrorRollbarReport: vi.fn(),
  validateGetRouteParams: vi.fn(),
}));

vi.mock("../../../custom/errors/handler/errorHandler", () => ({
  handleErrorEdgeCases: vi
    .fn()
    .mockReturnValue({ message: "Invalid URL parameters", status: 400 }),
}));

import { GET } from "../../../app/api/shipment/get_shipment_documents/route";
import {
  createErrorRollbarReport,
  validateGetRouteParams,
} from "../../../app/api/util";

function makeRequest(params: {
  t_num?: string;
  t_code?: string;
  y_m?: string;
}): Request {
  const url = new URL(
    "http://localhost/api/shipment/get_shipment_documents",
  );
  if (params.t_num) url.searchParams.set("t_num", params.t_num);
  if (params.t_code) url.searchParams.set("t_code", params.t_code);
  if (params.y_m) url.searchParams.set("y_m", params.y_m);
  return new Request(url.toString(), { method: "GET" });
}

const validParams = {
  trackingNumber: "1234567890",
  typeCode: "label",
  pickupYearAndMonth: "2026-05",
};

const mockDocumentResponse = {
  documents: [{ typeCode: "label", content: "base64encodedpdf==" }],
};

describe("GET /api/shipment/get_shipment_documents", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(validateGetRouteParams).mockReturnValue(validParams);
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        json: () => Promise.resolve(mockDocumentResponse),
      }),
    );
  });

  it("returns 200 with document data on success", async () => {
    const response = await GET(
      makeRequest({
        t_num: "1234567890",
        t_code: "label",
        y_m: "2026-05",
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Success");
    expect(body.data).toEqual(mockDocumentResponse);
  });

  it("builds DHL URL with correct tracking number and params", async () => {
    await GET(
      makeRequest({
        t_num: "1234567890",
        t_code: "label",
        y_m: "2026-05",
      }),
    );

    const [calledUrl] = vi.mocked(fetch).mock.calls[0];
    expect(String(calledUrl)).toContain("/shipments/1234567890/get-image");
    expect(String(calledUrl)).toContain("typeCode=label");
    expect(String(calledUrl)).toContain("pickupYearAndMonth=2026-05");
  });

  it("returns error status when validateGetRouteParams throws", async () => {
    vi.mocked(validateGetRouteParams).mockImplementation(() => {
      throw new Error("Invalid URL parameters");
    });

    const response = await GET(makeRequest({}));
    const body = await response.json();

    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(body.message).toBeDefined();
    expect(createErrorRollbarReport).toHaveBeenCalledWith(
      "shipment: get shipment documents",
      expect.any(Error),
      expect.any(Number),
    );
  });

  it("returns 500 on inner fetch error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("Network error")),
    );

    const response = await GET(
      makeRequest({
        t_num: "1234567890",
        t_code: "label",
        y_m: "2026-05",
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.message).toBe("Error");
  });
});
