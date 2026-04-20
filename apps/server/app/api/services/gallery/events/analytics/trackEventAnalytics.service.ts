import { EventAnalytics } from "@omenai/shared-models/models/analytics/GalleryEventsAnalyticsSchema";
export type AnalyticsMetric = "views" | "view_in_room" | "shares";

export async function trackEventMetric(
  eventId: string,
  metric: AnalyticsMetric,
) {
  try {
    // Get today's date strictly formatted as YYYY-MM-DD
    const today = new Date().toISOString().split("T")[0];

    // Atomically increment the total AND today's specific bucket
    await EventAnalytics.findOneAndUpdate(
      { event_id: eventId },
      {
        $inc: {
          [metric]: 1,
          [`daily_stats.${today}.${metric}`]: 1,
        },
      },
      { upsert: true, new: true },
    );
  } catch (error) {
    // We swallow the error gracefully.
    // A failed analytics tracking call should never crash the collector's UI.
    console.error(`Failed to track ${metric} for event ${eventId}:`, error);
  }
}
