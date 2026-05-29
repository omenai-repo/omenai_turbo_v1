/**
 * Integration tests for POST /api/promotionals/deletePromotionalData
 * Validates id, deletes a promotional by ObjectId, returns success message.
 */
import { describe, it, expect, afterEach } from "vitest";
import mongoose from "mongoose";
import { PromotionalModel } from "@omenai/shared-models/models/promotionals/PromotionalSchema";
import { POST } from "../../../app/api/promotionals/deletePromotionalData/route";

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/promotionals/deletePromotionalData", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

afterEach(async () => {
  await PromotionalModel.deleteMany({});
});

describe("POST /api/promotionals/deletePromotionalData — validation", () => {
  it("returns 400 when id is missing", async () => {
    const response = await POST(makeRequest({}));
    expect(response.status).toBe(400);
  });
});

describe("POST /api/promotionals/deletePromotionalData — not found", () => {
  it("returns 500 when the given ObjectId does not exist in DB", async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    const response = await POST(makeRequest({ id: fakeId }));
    expect(response.status).toBe(500);
  });
});

describe("POST /api/promotionals/deletePromotionalData — success", () => {
  it("returns 200 with success message when doc exists", async () => {
    const created = await PromotionalModel.create({
      headline: "To Delete",
      subheadline: "Will be removed",
      image: "https://cdn.example.com/delete.jpg",
      cta: "Delete CTA",
    });

    const response = await POST(makeRequest({ id: created._id.toString() }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Promotional data deleted");
  });

  it("removes the document from DB after deletion", async () => {
    const created = await PromotionalModel.create({
      headline: "Gone Soon",
      subheadline: "Temporary",
      image: "https://cdn.example.com/gone.jpg",
      cta: "Bye",
    });

    await POST(makeRequest({ id: created._id.toString() }));

    const still_exists = await PromotionalModel.findById(created._id);
    expect(still_exists).toBeNull();
  });
});
