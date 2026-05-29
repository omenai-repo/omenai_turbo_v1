/**
 * Integration tests for POST /api/promotionals/updatePromotionalData
 * Validates id and updates object, applies $set to an existing promotional document.
 */
import { describe, it, expect, afterEach } from "vitest";
import mongoose from "mongoose";
import { PromotionalModel } from "@omenai/shared-models/models/promotionals/PromotionalSchema";
import { POST } from "../../../app/api/promotionals/updatePromotionalData/route";

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/promotionals/updatePromotionalData", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

afterEach(async () => {
  await PromotionalModel.deleteMany({});
});

describe("POST /api/promotionals/updatePromotionalData — validation", () => {
  it("returns 400 when id is missing", async () => {
    const response = await POST(makeRequest({ updates: { headline: "New Title" } }));
    expect(response.status).toBe(400);
  });

  it("returns 400 when updates is missing", async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    const response = await POST(makeRequest({ id: fakeId }));
    expect(response.status).toBe(400);
  });
});

describe("POST /api/promotionals/updatePromotionalData — not found", () => {
  it("returns 500 when the given ObjectId does not exist in DB", async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    const response = await POST(
      makeRequest({ id: fakeId, updates: { headline: "Ghost Update" } }),
    );
    expect(response.status).toBe(500);
  });
});

describe("POST /api/promotionals/updatePromotionalData — success", () => {
  it("returns 200 with success message when doc exists and update is applied", async () => {
    const created = await PromotionalModel.create({
      headline: "Original Headline",
      subheadline: "Original Sub",
      image: "https://cdn.example.com/original.jpg",
      cta: "Original CTA",
    });

    const response = await POST(
      makeRequest({ id: created._id.toString(), updates: { headline: "Updated Headline" } }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Promotional data updated");
  });

  it("persists the new headline value in the DB after update", async () => {
    const created = await PromotionalModel.create({
      headline: "Before Update",
      subheadline: "Sub",
      image: "https://cdn.example.com/before.jpg",
      cta: "CTA",
    });

    await POST(
      makeRequest({ id: created._id.toString(), updates: { headline: "After Update" } }),
    );

    const updated = await PromotionalModel.findById(created._id);
    expect(updated!.headline).toBe("After Update");
  });
});
