// Location: @omenai/shared-utils/src/trackPlatformEvent.ts (or lib/analytics.ts)

import { extractUserTrackingData } from "./extractTrackingData";
import { EventType } from "@omenai/shared-types";
import { PlatformEvents } from "@omenai/shared-models/models/analytics/PlatformEventsSchema";

// We define a strict interface for what the function expects
interface TrackEventParams {
  req: Request;
  event_type: EventType;
  session_id: string;
  user_id?: string | null;
  art_id?: string;
  entity_id?: string;
  metadata?: Record<string, any>;
}

export async function trackPlatformEvent(params: TrackEventParams) {
  try {
    const {
      req,
      event_type,
      session_id,
      user_id,
      art_id,
      entity_id,
      metadata,
    } = params;

    // 1. Extract the geolocation and device data silently using our Phase 1 utility
    const tracking_data = extractUserTrackingData(req);

    // 2. Construct the exact payload our Mongoose schema expects
    const eventPayload = {
      event_type,
      user_id: user_id || null,
      session_id,
      art_id: art_id || null,
      entity_id: entity_id || null,
      tracking_data,
      metadata: metadata || {},
    };

    // 3. Save to MongoDB
    // Note: In a Vercel serverless environment, you must 'await' this.
    // If you don't, Vercel might kill the function before the DB write finishes.
    await PlatformEvents.create(eventPayload);

    return { success: true };
  } catch (error) {
    // 4. Fail Silently Strategy
    // Analytics should NEVER break core business logic. If the DB write fails,
    // we log it for the developer, but we don't throw an error to the parent function.
    console.error(
      `[Analytics Error] Failed to track ${params.event_type}:`,
      error,
    );
    return { success: false };
  }
}
