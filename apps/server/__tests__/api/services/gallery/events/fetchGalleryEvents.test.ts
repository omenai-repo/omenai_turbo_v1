import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@omenai/shared-models/models/events/GalleryEventSchema", () => ({
  GalleryEvent: { find: vi.fn() },
}));

import { fetchGalleryEvents } from "../../../../../app/api/services/gallery/events/fetchGalleryEvents.service";
import { GalleryEvent } from "@omenai/shared-models/models/events/GalleryEventSchema";

const futureDate = new Date(Date.now() + 86400000 * 30).toISOString();
const pastDate = new Date(Date.now() - 86400000 * 30).toISOString();

const mockActiveEvent = {
  event_id: "evt-active",
  title: "Active Show",
  is_archived: false,
  end_date: futureDate,
};
const mockPastEvent = {
  event_id: "evt-past",
  title: "Past Show",
  is_archived: true,
  end_date: pastDate,
};
const mockExpiredEvent = {
  event_id: "evt-expired",
  title: "Expired Show",
  is_archived: false,
  end_date: pastDate,
};

function setupFindChain(docs: any[]) {
  vi.mocked(GalleryEvent.find).mockReturnValue({
    sort: vi.fn().mockReturnValue({
      lean: vi.fn().mockResolvedValue(docs),
    }),
  } as any);
}

describe("fetchGalleryEvents", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupFindChain([mockActiveEvent, mockPastEvent, mockExpiredEvent]);
  });

  it("returns isOk:true with categorized events", async () => {
    const result = await fetchGalleryEvents("gallery-1");

    expect(result.isOk).toBe(true);
    expect(result.activeEvents).toBeDefined();
    expect(result.pastEvents).toBeDefined();
  });

  it("queries events for the correct gallery_id", async () => {
    await fetchGalleryEvents("gallery-1");

    expect(GalleryEvent.find).toHaveBeenCalledWith({ gallery_id: "gallery-1" });
  });

  it("puts non-archived future events in activeEvents", async () => {
    const result = await fetchGalleryEvents("gallery-1");

    expect(result.activeEvents).toContainEqual(expect.objectContaining({ event_id: "evt-active" }));
  });

  it("puts archived events in pastEvents", async () => {
    const result = await fetchGalleryEvents("gallery-1");

    expect(result.pastEvents).toContainEqual(expect.objectContaining({ event_id: "evt-past" }));
  });

  it("puts non-archived expired events in pastEvents", async () => {
    const result = await fetchGalleryEvents("gallery-1");

    expect(result.pastEvents).toContainEqual(expect.objectContaining({ event_id: "evt-expired" }));
  });

  it("returns empty arrays when no events exist", async () => {
    setupFindChain([]);

    const result = await fetchGalleryEvents("gallery-1");

    expect(result.isOk).toBe(true);
    expect(result.activeEvents).toEqual([]);
    expect(result.pastEvents).toEqual([]);
  });

  it("returns isOk:false when find throws", async () => {
    vi.mocked(GalleryEvent.find).mockReturnValue({
      sort: vi.fn().mockReturnValue({
        lean: vi.fn().mockRejectedValue(new Error("DB error")),
      }),
    } as any);

    const result = await fetchGalleryEvents("gallery-1");

    expect(result.isOk).toBe(false);
    expect(result.message).toBe("Failed to load gallery programming.");
  });
});
