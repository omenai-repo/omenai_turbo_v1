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
    create: vi.fn(),
  },
}));

vi.mock("../../../app/api/util", async () => {
  const { buildValidateRequestBodyMock } = await import("../../helpers/util-mock");
  return buildValidateRequestBodyMock();
});

import { POST } from "../../../app/api/promotionals/createPromotional/route";
import { PromotionalModel } from "@omenai/shared-models/models/promotionals/PromotionalSchema";
import { validateRequestBody } from "../../../app/api/util";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";

const validBody = {
  headline: "Discover African Art",
  subheadline: "Curated collections from emerging artists",
  image: "https://cdn.omenai.com/promo.jpg",
  cta: "Explore Now",
};

const mockPromo = { _id: "promo-1", ...validBody };

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/promotionals/createPromotional", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/promotionals/createPromotional", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(PromotionalModel.create).mockResolvedValue(mockPromo as any);
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

  it("returns 200 with success message on creation", async () => {
    const response = await POST(makeRequest(validBody));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Promotional data uploaded");
  });

  it("passes validated fields to PromotionalModel.create", async () => {
    await POST(makeRequest(validBody));

    expect(PromotionalModel.create).toHaveBeenCalledWith(
      expect.objectContaining(validBody),
    );
  });

  it("returns 500 when create returns falsy", async () => {
    vi.mocked(PromotionalModel.create).mockResolvedValue(null as any);

    const response = await POST(makeRequest(validBody));

    expect(response.status).toBe(500);
  });

  it("returns 500 when create throws", async () => {
    vi.mocked(PromotionalModel.create).mockRejectedValue(new Error("DB error"));

    const response = await POST(makeRequest(validBody));

    expect(response.status).toBe(500);
  });

  it("returns 400 when required fields are missing", async () => {
    const response = await POST(makeRequest({ headline: "Only headline" }));

    expect(response.status).toBe(400);
  });

  it("returns 500 when connectMongoDB throws", async () => {
    vi.mocked(connectMongoDB).mockRejectedValueOnce(new Error("Connection failed"));

    const response = await POST(makeRequest(validBody));

    expect(response.status).toBe(500);
  });
});
