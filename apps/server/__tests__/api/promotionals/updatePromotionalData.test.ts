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

vi.mock("@omenai/shared-models/models/promotionals/PromotionalSchema", () => ({
  PromotionalModel: {
    findByIdAndUpdate: vi.fn(),
  },
}));

vi.mock("../../../app/api/util", async () => {
  const { buildValidateRequestBodyMock } = await import("../../helpers/util-mock");
  return buildValidateRequestBodyMock();
});

import { POST } from "../../../app/api/promotionals/updatePromotionalData/route";
import { PromotionalModel } from "@omenai/shared-models/models/promotionals/PromotionalSchema";
import { validateRequestBody } from "../../../app/api/util";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";

const mockUpdated = { _id: "promo-1", headline: "New Headline" };

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/promotionals/updatePromotionalData", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/promotionals/updatePromotionalData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(PromotionalModel.findByIdAndUpdate).mockResolvedValue(mockUpdated as any);
    vi.mocked(validateRequestBody).mockImplementation(
      async (request: Request, schema: any) => {
        const body = await request.json();
        const result = schema.safeParse(body);
        if (!result.success) {
          const msg = result.error.issues
            .map((e: any) => `${e.path.join(".")}: ${e.message}`)
            .join(", ");
          throw Object.assign(new Error(`Validation Failed: ${msg}`), {
            name: "BadRequestError",
          });
        }
        return result.data;
      },
    );
  });

  it("returns 200 with success message on update", async () => {
    const response = await POST(
      makeRequest({ id: "promo-1", updates: { headline: "New Headline" } }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Promotional data updated");
  });

  it("calls findByIdAndUpdate with id and $set updates", async () => {
    await POST(
      makeRequest({ id: "promo-1", updates: { headline: "New Headline", cta: "Click" } }),
    );

    expect(PromotionalModel.findByIdAndUpdate).toHaveBeenCalledWith(
      "promo-1",
      { $set: { headline: "New Headline", cta: "Click" } },
    );
  });

  it("accepts partial updates (only subheadline)", async () => {
    await POST(
      makeRequest({ id: "promo-1", updates: { subheadline: "Updated sub" } }),
    );

    expect(PromotionalModel.findByIdAndUpdate).toHaveBeenCalledWith(
      "promo-1",
      { $set: { subheadline: "Updated sub" } },
    );
  });

  it("returns 500 when findByIdAndUpdate returns falsy", async () => {
    vi.mocked(PromotionalModel.findByIdAndUpdate).mockResolvedValue(null as any);

    const response = await POST(
      makeRequest({ id: "promo-1", updates: { headline: "Test" } }),
    );

    expect(response.status).toBe(500);
  });

  it("returns 500 when findByIdAndUpdate throws", async () => {
    vi.mocked(PromotionalModel.findByIdAndUpdate).mockRejectedValue(
      new Error("DB error"),
    );

    const response = await POST(
      makeRequest({ id: "promo-1", updates: { headline: "Test" } }),
    );

    expect(response.status).toBe(500);
  });

  it("returns 400 when id is missing", async () => {
    const response = await POST(
      makeRequest({ updates: { headline: "Test" } }),
    );

    expect(response.status).toBe(400);
  });

  it("returns 400 when updates object is missing", async () => {
    const response = await POST(makeRequest({ id: "promo-1" }));

    expect(response.status).toBe(400);
  });

  it("returns 500 when connectMongoDB throws", async () => {
    vi.mocked(connectMongoDB).mockRejectedValueOnce(new Error("Connection failed"));

    const response = await POST(
      makeRequest({ id: "promo-1", updates: { headline: "Test" } }),
    );

    expect(response.status).toBe(500);
  });
});
