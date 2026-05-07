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
    findByIdAndDelete: vi.fn(),
  },
}));

vi.mock("../../../app/api/util", async () => {
  const { buildValidateRequestBodyMock } = await import("../../helpers/util-mock");
  return buildValidateRequestBodyMock();
});

import { POST } from "../../../app/api/promotionals/deletePromotionalData/route";
import { PromotionalModel } from "@omenai/shared-models/models/promotionals/PromotionalSchema";
import { validateRequestBody } from "../../../app/api/util";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";

const mockDeleted = { _id: "promo-1", headline: "Old Promo" };

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/promotionals/deletePromotionalData", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/promotionals/deletePromotionalData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(PromotionalModel.findByIdAndDelete).mockResolvedValue(mockDeleted as any);
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

  it("returns 200 with success message on deletion", async () => {
    const response = await POST(makeRequest({ id: "promo-1" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Promotional data deleted");
  });

  it("calls findByIdAndDelete with the provided id", async () => {
    await POST(makeRequest({ id: "promo-1" }));

    expect(PromotionalModel.findByIdAndDelete).toHaveBeenCalledWith("promo-1");
  });

  it("returns 500 when findByIdAndDelete returns falsy", async () => {
    vi.mocked(PromotionalModel.findByIdAndDelete).mockResolvedValue(null as any);

    const response = await POST(makeRequest({ id: "promo-1" }));

    expect(response.status).toBe(500);
  });

  it("returns 500 when findByIdAndDelete throws", async () => {
    vi.mocked(PromotionalModel.findByIdAndDelete).mockRejectedValue(
      new Error("DB error"),
    );

    const response = await POST(makeRequest({ id: "promo-1" }));

    expect(response.status).toBe(500);
  });

  it("returns 400 when id is missing", async () => {
    const response = await POST(makeRequest({}));

    expect(response.status).toBe(400);
  });

  it("returns 500 when connectMongoDB throws", async () => {
    vi.mocked(connectMongoDB).mockRejectedValueOnce(new Error("Connection failed"));

    const response = await POST(makeRequest({ id: "promo-1" }));

    expect(response.status).toBe(500);
  });
});
