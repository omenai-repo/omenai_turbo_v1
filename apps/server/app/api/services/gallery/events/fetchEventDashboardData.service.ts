import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { GalleryEvent } from "@omenai/shared-models/models/events/GalleryEventSchema";
import { fetchArtworksFromCache } from "../../../artworks/utils";
import {
  GalleryEventAnalytics,
  GalleryEvent as GalleryEventType,
} from "@omenai/shared-types";
import { EventAnalytics } from "@omenai/shared-models/models/analytics/GalleryEventsAnalyticsSchema";

export async function fetchEventDashboardData(
  eventId: string,
  galleryId: string,
) {
  try {
    await connectMongoDB();

    // Fetch the core event
    const event = (await GalleryEvent.findOne({
      event_id: eventId,
      gallery_id: galleryId,
    }).lean()) as unknown as GalleryEventType;

    if (!event) return { isOk: false, message: "Event not found" };

    // Fetch the analytics (if no one has visited yet, this might be null)
    const analytics = (await EventAnalytics.findOne({
      event_id: eventId,
    }).lean()) as unknown as GalleryEventAnalytics;

    // 2. Hydrate the artworks directly from Redis
    let hydratedArtworks: any[] = [];
    if (event.featured_artworks && event.featured_artworks.length > 0) {
      hydratedArtworks = await fetchArtworksFromCache(event.featured_artworks);
    }

    const analyticsUI = {
      views: analytics?.views || 0,
      views_trend: calculateTrend(analytics?.daily_stats, "views"),

      view_in_room: analytics?.view_in_room || 0,
      view_in_room_trend: calculateTrend(
        analytics?.daily_stats,
        "view_in_room",
      ),

      shares: analytics?.shares || 0,
      shares_trend: calculateTrend(analytics?.daily_stats, "shares"),
    };

    const reversedHydratedArtworks = [...hydratedArtworks].reverse();
    // Merge them to perfectly match your UI requirements
    const mergedEvent = {
      ...event,
      analytics: analyticsUI,
    };

    return {
      isOk: true,
      data: {
        event: mergedEvent,
        artworks: reversedHydratedArtworks,
      },
    };
  } catch (error) {
    console.error("Error fetching event dashboard data:", error);
    return {
      isOk: false,
      message: "Internal server error while loading dashboard.",
      data: null,
    };
  }
}

export const calculateTrend = (
  dailyStats: Record<string, any> | undefined,
  metric: "views" | "view_in_room" | "shares",
): string => {
  if (!dailyStats || Object.keys(dailyStats).length === 0) return "+0%";

  let current7Days = 0;
  let previous7Days = 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Loop through the last 14 days
  for (let i = 0; i < 14; i++) {
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() - i);
    const dateStr = targetDate.toISOString().split("T")[0];

    const dayValue = dailyStats[dateStr]?.[metric] || 0;

    if (i < 7) {
      current7Days += dayValue; // Days 0-6
    } else {
      previous7Days += dayValue; // Days 7-13
    }
  }

  // If no activity in the previous 7 days, but we have activity now, that's a 100% bump.
  if (previous7Days === 0) {
    return current7Days > 0 ? "+100%" : "+0%";
  }

  const percentageChange =
    ((current7Days - previous7Days) / previous7Days) * 100;

  // Format beautifully: "+12%", "-5%", or "+0%"
  const rounded = Math.round(percentageChange);
  return rounded > 0 ? `+${rounded}%` : `${rounded}%`;
};
