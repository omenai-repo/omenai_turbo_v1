/**
 * Integration tests for POST /api/promotionals/createPromotional
 * Validates input, creates a promotional document, and returns a success message.
 */
import { describe, it, expect, afterEach } from "vitest";
import { PromotionalModel } from "@omenai/shared-models/models/promotionals/PromotionalSchema";
import { POST } from "../../../app/api/promotionals/createPromotional/route";

function makePromo(overrides: Record<string, any> = {}) {
  return {
    headline: "Summer Sale",
    subheadline: "Up to 50% off select artworks",
    image: "https://cdn.example.com/promo.jpg",
    cta: "Shop Now",
    ...overrides,
  };
}

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/promotionals/createPromotional", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

afterEach(async () => {
  await PromotionalModel.deleteMany({});
});

describe("POST /api/promotionals/createPromotional — validation", () => {
  it("returns 400 when headline is missing", async () => {
    const response = await POST(makeRequest(makePromo({ headline: undefined })));
    expect(response.status).toBe(400);
  });

  it("returns 400 when image is missing", async () => {
    const response = await POST(makeRequest(makePromo({ image: undefined })));
    expect(response.status).toBe(400);
  });

  it("returns 400 when subheadline is missing", async () => {
    const response = await POST(makeRequest(makePromo({ subheadline: undefined })));
    expect(response.status).toBe(400);
  });

  it("returns 400 when cta is missing", async () => {
    const response = await POST(makeRequest(makePromo({ cta: undefined })));
    expect(response.status).toBe(400);
  });
});

describe("POST /api/promotionals/createPromotional — success", () => {
  it("returns 200 with success message when all fields are provided", async () => {
    const response = await POST(makeRequest(makePromo()));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Promotional data uploaded");
  });

  it("persists the document in DB with correct fields", async () => {
    const promo = makePromo();
    await POST(makeRequest(promo));

    const saved = await PromotionalModel.findOne({ headline: promo.headline });
    expect(saved).not.toBeNull();
    expect(saved!.headline).toBe(promo.headline);
    expect(saved!.subheadline).toBe(promo.subheadline);
    expect(saved!.image).toBe(promo.image);
    expect(saved!.cta).toBe(promo.cta);
  });
});
