import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@omenai/shared-models/models/events/GalleryEventSchema", () => ({
  GalleryEvent: { aggregate: vi.fn() },
}));

vi.mock("@omenai/upstash-config", () => ({
  redis: { get: vi.fn() },
}));

import {
  getAllFairsAndEventsService,
  getIndividualFairOrEventService,
} from "../../../../app/api/services/events/getEvents.service";
import { GalleryEvent } from "@omenai/shared-models/models/events/GalleryEventSchema";
import { redis } from "@omenai/upstash-config";

const mockEvent = {
  event_id: "fair-001",
  title: "Art Basel",
  event_type: "art_fair",
  gallery_id: "gallery-1",
  featured_artworks: ["art-1", "art-2"],
  gallery_data: { name: "Omenai Gallery", logo: "logo.png" },
};

const mockArtwork = { art_id: "art-1", title: "Piece One" };

describe("getAllFairsAndEventsService", () => {
  const mockAggResult = [
    {
      metadata: [{ total: 24, page: 1, limit: 12 }],
      data: [
        { event_id: "fair-001", title: "Art Basel", event_type: "art_fair" },
      ],
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(GalleryEvent.aggregate).mockResolvedValue(mockAggResult);
  });

  it("returns isOk:true with data and pagination on success", async () => {
    const result = await getAllFairsAndEventsService(1, 12, "All");

    expect(result.isOk).toBe(true);
    expect(result.data).toEqual(mockAggResult[0].data);
    expect(result.pagination?.totalPages).toBe(2);
  });

  it("uses default pagination values when not provided", async () => {
    await getAllFairsAndEventsService();

    const pipeline = vi.mocked(GalleryEvent.aggregate).mock.calls[0][0];
    expect(pipeline[0].$match.event_type).toEqual({ $in: ["art_fair", "viewing_room"] });
  });

  it("filters strictly by art_fair when filter is Fairs", async () => {
    await getAllFairsAndEventsService(1, 12, "Fairs");

    const pipeline = vi.mocked(GalleryEvent.aggregate).mock.calls[0][0];
    expect(pipeline[0].$match.event_type).toBe("art_fair");
  });

  it("filters strictly by viewing_room when filter is Viewing Rooms", async () => {
    await getAllFairsAndEventsService(1, 12, "Viewing Rooms");

    const pipeline = vi.mocked(GalleryEvent.aggregate).mock.calls[0][0];
    expect(pipeline[0].$match.event_type).toBe("viewing_room");
  });

  it("returns zero pagination when no results", async () => {
    vi.mocked(GalleryEvent.aggregate).mockResolvedValue([
      { metadata: [], data: [] },
    ]);

    const result = await getAllFairsAndEventsService();

    expect(result.isOk).toBe(true);
    expect(result.pagination?.total).toBe(0);
  });

  it("returns isOk:false when aggregate throws", async () => {
    vi.mocked(GalleryEvent.aggregate).mockRejectedValue(new Error("DB error"));

    const result = await getAllFairsAndEventsService();

    expect(result.isOk).toBe(false);
    expect(result.message).toBe("Failed to fetch events.");
  });
});

describe("getIndividualFairOrEventService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(GalleryEvent.aggregate).mockResolvedValue([mockEvent]);
    vi.mocked(redis.get).mockResolvedValue(mockArtwork as any);
  });

  it("returns isOk:true with event and hydrated artworks", async () => {
    const result = await getIndividualFairOrEventService("fair-001");

    expect(result.isOk).toBe(true);
    expect(result.data).toBeDefined();
  });

  it("fetches artworks from Redis for each featured artwork ID", async () => {
    await getIndividualFairOrEventService("fair-001");

    expect(redis.get).toHaveBeenCalledWith("artwork:art-1");
    expect(redis.get).toHaveBeenCalledWith("artwork:art-2");
  });

  it("returns isOk:false when event is not found", async () => {
    vi.mocked(GalleryEvent.aggregate).mockResolvedValue([]);

    const result = await getIndividualFairOrEventService("unknown-id");

    expect(result.isOk).toBe(false);
    expect(result.message).toBe("Event not found.");
  });

  it("filters null artworks from Redis cache misses", async () => {
    vi.mocked(redis.get).mockResolvedValueOnce(null).mockResolvedValueOnce(mockArtwork as any);

    const result = await getIndividualFairOrEventService("fair-001");

    expect(result.isOk).toBe(true);
    expect(result.data?.artworks).toHaveLength(1);
  });

  it("parses string artworks from Redis", async () => {
    vi.mocked(redis.get).mockResolvedValue(JSON.stringify(mockArtwork) as any);

    const result = await getIndividualFairOrEventService("fair-001");

    expect(result.data?.artworks[0]).toMatchObject(mockArtwork);
  });

  it("returns isOk:false when aggregate throws", async () => {
    vi.mocked(GalleryEvent.aggregate).mockRejectedValue(new Error("DB error"));

    const result = await getIndividualFairOrEventService("fair-001");

    expect(result.isOk).toBe(false);
    expect(result.message).toBe("Internal server error.");
  });
});
