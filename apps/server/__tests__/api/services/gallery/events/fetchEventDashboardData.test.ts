import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@omenai/shared-models/models/events/GalleryEventSchema", () => ({
  GalleryEvent: { findOne: vi.fn() },
}));

vi.mock("@omenai/shared-models/models/analytics/GalleryEventsAnalyticsSchema", () => ({
  EventAnalytics: { findOne: vi.fn() },
}));

vi.mock("../../../../../app/api/artworks/utils", () => ({
  fetchArtworksFromCache: vi.fn(),
}));

import {
  fetchEventDashboardData,
  calculateTrend,
} from "../../../../../app/api/services/gallery/events/fetchEventDashboardData.service";
import { GalleryEvent } from "@omenai/shared-models/models/events/GalleryEventSchema";
import { EventAnalytics } from "@omenai/shared-models/models/analytics/GalleryEventsAnalyticsSchema";
import { fetchArtworksFromCache } from "../../../../../app/api/artworks/utils";

const mockEvent = {
  event_id: "evt-001",
  title: "Emergence",
  gallery_id: "gallery-1",
  featured_artworks: ["art-1", "art-2"],
};

const mockAnalytics = {
  event_id: "evt-001",
  views: 100,
  view_in_room: 50,
  shares: 20,
  daily_stats: {},
};

const mockArtworks = [{ art_id: "art-1" }, { art_id: "art-2" }];

describe("fetchEventDashboardData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(GalleryEvent.findOne).mockReturnValue({
      lean: vi.fn().mockResolvedValue(mockEvent),
    } as any);
    vi.mocked(EventAnalytics.findOne).mockReturnValue({
      lean: vi.fn().mockResolvedValue(mockAnalytics),
    } as any);
    vi.mocked(fetchArtworksFromCache).mockResolvedValue(mockArtworks);
  });

  it("returns isOk:true with event, artworks and analytics", async () => {
    const result = await fetchEventDashboardData("evt-001", "gallery-1");

    expect(result.isOk).toBe(true);
    expect(result.data?.event).toBeDefined();
    expect(result.data?.artworks).toBeDefined();
  });

  it("includes analytics summary in the event", async () => {
    const result = await fetchEventDashboardData("evt-001", "gallery-1");

    expect(result.data?.event.analytics.views).toBe(100);
    expect(result.data?.event.analytics.shares).toBe(20);
  });

  it("returns reversed artworks order", async () => {
    const result = await fetchEventDashboardData("evt-001", "gallery-1");

    expect(result.data?.artworks[0]).toEqual(mockArtworks[1]);
  });

  it("defaults analytics to 0 when no analytics record exists", async () => {
    vi.mocked(EventAnalytics.findOne).mockReturnValue({
      lean: vi.fn().mockResolvedValue(null),
    } as any);

    const result = await fetchEventDashboardData("evt-001", "gallery-1");

    expect(result.data?.event.analytics.views).toBe(0);
    expect(result.data?.event.analytics.shares).toBe(0);
  });

  it("skips fetchArtworksFromCache when event has no featured artworks", async () => {
    vi.mocked(GalleryEvent.findOne).mockReturnValue({
      lean: vi.fn().mockResolvedValue({ ...mockEvent, featured_artworks: [] }),
    } as any);

    await fetchEventDashboardData("evt-001", "gallery-1");

    expect(fetchArtworksFromCache).not.toHaveBeenCalled();
  });

  it("returns isOk:false when event is not found", async () => {
    vi.mocked(GalleryEvent.findOne).mockReturnValue({
      lean: vi.fn().mockResolvedValue(null),
    } as any);

    const result = await fetchEventDashboardData("evt-001", "gallery-1");

    expect(result.isOk).toBe(false);
    expect(result.message).toBe("Event not found");
  });

  it("returns isOk:false when an error is thrown", async () => {
    vi.mocked(GalleryEvent.findOne).mockReturnValue({
      lean: vi.fn().mockRejectedValue(new Error("DB error")),
    } as any);

    const result = await fetchEventDashboardData("evt-001", "gallery-1");

    expect(result.isOk).toBe(false);
    expect(result.message).toBe("Internal server error while loading dashboard.");
  });
});

describe("calculateTrend", () => {
  it("returns +0% when dailyStats is undefined", () => {
    expect(calculateTrend(undefined, "views")).toBe("+0%");
  });

  it("returns +0% when dailyStats is empty", () => {
    expect(calculateTrend({}, "views")).toBe("+0%");
  });

  it("returns +100% when current period has activity but previous has none", () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split("T")[0];
    const stats = { [todayStr]: { views: 5, view_in_room: 0, shares: 0 } };

    expect(calculateTrend(stats, "views")).toBe("+100%");
  });

  it("returns +0% when both periods have no activity", () => {
    const stats = {};

    expect(calculateTrend(stats, "views")).toBe("+0%");
  });

  it("returns negative percentage when current is less than previous", () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const stats: Record<string, any> = {};

    // Add 0 views this week
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      stats[d.toISOString().split("T")[0]] = { views: 0 };
    }
    // Add 10 views last week
    for (let i = 7; i < 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      stats[d.toISOString().split("T")[0]] = { views: 10 };
    }

    const result = calculateTrend(stats, "views");
    expect(result).toBe("-100%");
  });
});
