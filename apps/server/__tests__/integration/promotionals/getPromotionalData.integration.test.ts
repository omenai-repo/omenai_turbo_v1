/**
 * Integration tests for GET /api/promotionals/getPromotionalData
 * Returns all promotionals sorted by createdAt descending.
 */
import { describe, it, expect, afterEach } from "vitest";
import { PromotionalModel } from "@omenai/shared-models/models/promotionals/PromotionalSchema";
import { GET } from "../../../app/api/promotionals/getPromotionalData/route";

function makeRequest(): Request {
  return new Request("http://localhost/api/promotionals/getPromotionalData", {
    method: "GET",
  });
}

afterEach(async () => {
  await PromotionalModel.deleteMany({});
});

describe("GET /api/promotionals/getPromotionalData — empty DB", () => {
  it("returns 200 with an empty array when no promotionals exist", async () => {
    const response = await GET(makeRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Promotional data retreived");
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data).toHaveLength(0);
  });
});

describe("GET /api/promotionals/getPromotionalData — with data", () => {
  it("returns 200 with an array of length 1 when one promotional exists", async () => {
    await PromotionalModel.create({
      headline: "Solo Promo",
      subheadline: "Only one",
      image: "https://cdn.example.com/solo.jpg",
      cta: "View",
    });

    const response = await GET(makeRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toHaveLength(1);
    expect(body.data[0].headline).toBe("Solo Promo");
  });

  it("returns promotionals sorted newest first when two are seeded", async () => {
    const older = new Date("2024-01-01T00:00:00.000Z");
    const newer = new Date("2024-06-01T00:00:00.000Z");

    await PromotionalModel.collection.insertMany([
      {
        headline: "Old Promo",
        subheadline: "Older sub",
        image: "https://cdn.example.com/old.jpg",
        cta: "Old CTA",
        createdAt: older,
        updatedAt: older,
      },
      {
        headline: "New Promo",
        subheadline: "Newer sub",
        image: "https://cdn.example.com/new.jpg",
        cta: "New CTA",
        createdAt: newer,
        updatedAt: newer,
      },
    ]);

    const response = await GET(makeRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toHaveLength(2);
    expect(body.data[0].headline).toBe("New Promo");
    expect(body.data[1].headline).toBe("Old Promo");
  });
});
