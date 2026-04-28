import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@omenai/shared-models/models/events/GalleryEventSchema", () => ({
  GalleryEvent: { findOneAndUpdate: vi.fn() },
}));

import { toggleEventVisibility } from "../../../../../app/api/services/gallery/events/toggleEventVisibility.service";
import { GalleryEvent } from "@omenai/shared-models/models/events/GalleryEventSchema";

const mockUpdatedEvent = { event_id: "evt-001", is_published: true };

describe("toggleEventVisibility", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(GalleryEvent.findOneAndUpdate).mockResolvedValue(mockUpdatedEvent as any);
  });

  it("returns isOk:true with published message when targetStatus is true", async () => {
    const result = await toggleEventVisibility("evt-001", "gallery-1", true);

    expect(result.isOk).toBe(true);
    expect(result.message).toBe("Presentation successfully published.");
  });

  it("returns isOk:true with drafts message when targetStatus is false", async () => {
    const result = await toggleEventVisibility("evt-001", "gallery-1", false);

    expect(result.isOk).toBe(true);
    expect(result.message).toBe("Presentation successfully moved to drafts.");
  });

  it("calls findOneAndUpdate with correct query and update", async () => {
    await toggleEventVisibility("evt-001", "gallery-1", true);

    expect(GalleryEvent.findOneAndUpdate).toHaveBeenCalledWith(
      { event_id: "evt-001", gallery_id: "gallery-1" },
      { $set: { is_published: true } },
      { new: true },
    );
  });

  it("returns isOk:false when event is not found", async () => {
    vi.mocked(GalleryEvent.findOneAndUpdate).mockResolvedValue(null);

    const result = await toggleEventVisibility("evt-001", "gallery-1", true);

    expect(result.isOk).toBe(false);
    expect(result.message).toBe("Event not found or unauthorized.");
  });

  it("returns isOk:false when findOneAndUpdate throws", async () => {
    vi.mocked(GalleryEvent.findOneAndUpdate).mockRejectedValue(new Error("DB error"));

    const result = await toggleEventVisibility("evt-001", "gallery-1", true);

    expect(result.isOk).toBe(false);
    expect(result.message).toBe("Internal server error.");
  });
});
