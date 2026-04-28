import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@omenai/shared-models/models/events/GalleryEventSchema", () => ({
  GalleryEvent: { findOneAndUpdate: vi.fn() },
}));

import { updateEventDetails } from "../../../../../app/api/services/gallery/events/updateEventDetails.service";
import { GalleryEvent } from "@omenai/shared-models/models/events/GalleryEventSchema";

const mockUpdatedEvent = { event_id: "evt-001", title: "Updated Title" };

describe("updateEventDetails", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(GalleryEvent.findOneAndUpdate).mockResolvedValue(mockUpdatedEvent as any);
  });

  it("returns isOk:true on successful update", async () => {
    const result = await updateEventDetails("evt-001", "gallery-1", { title: "Updated Title" });

    expect(result.isOk).toBe(true);
    expect(result.message).toBe("Event details updated successfully.");
  });

  it("updates only allowed fields (title, description, dates)", async () => {
    await updateEventDetails("evt-001", "gallery-1", {
      title: "New Title",
      description: "New Desc",
      unknownField: "should be ignored",
    });

    expect(GalleryEvent.findOneAndUpdate).toHaveBeenCalledWith(
      { event_id: "evt-001", gallery_id: "gallery-1" },
      { $set: { title: "New Title", description: "New Desc" } },
      { new: true },
    );
  });

  it("updates cover_image when provided", async () => {
    await updateEventDetails("evt-001", "gallery-1", { cover_image: "new-img.jpg" });

    expect(GalleryEvent.findOneAndUpdate).toHaveBeenCalledWith(
      expect.any(Object),
      { $set: { cover_image: "new-img.jpg" } },
      { new: true },
    );
  });

  it("updates location object when provided", async () => {
    const location = { venue: "Tate Modern", city: "London", country: "UK" };

    await updateEventDetails("evt-001", "gallery-1", { location });

    expect(GalleryEvent.findOneAndUpdate).toHaveBeenCalledWith(
      expect.any(Object),
      { $set: { location } },
      { new: true },
    );
  });

  it("returns isOk:false when no valid fields are provided", async () => {
    const result = await updateEventDetails("evt-001", "gallery-1", { unknownField: "value" });

    expect(result.isOk).toBe(false);
    expect(result.message).toBe("No valid fields provided for update.");
    expect(GalleryEvent.findOneAndUpdate).not.toHaveBeenCalled();
  });

  it("returns isOk:false when event is not found", async () => {
    vi.mocked(GalleryEvent.findOneAndUpdate).mockResolvedValue(null);

    const result = await updateEventDetails("evt-001", "gallery-1", { title: "New" });

    expect(result.isOk).toBe(false);
    expect(result.message).toBe("Event not found or unauthorized.");
  });

  it("returns isOk:false when findOneAndUpdate throws", async () => {
    vi.mocked(GalleryEvent.findOneAndUpdate).mockRejectedValue(new Error("DB error"));

    const result = await updateEventDetails("evt-001", "gallery-1", { title: "New" });

    expect(result.isOk).toBe(false);
    expect(result.message).toBe("Internal server error during update.");
  });

  it("updates booth_number and external_url when provided", async () => {
    await updateEventDetails("evt-001", "gallery-1", {
      booth_number: "B12",
      external_url: "https://example.com",
    });

    expect(GalleryEvent.findOneAndUpdate).toHaveBeenCalledWith(
      expect.any(Object),
      { $set: { booth_number: "B12", external_url: "https://example.com" } },
      { new: true },
    );
  });
});
