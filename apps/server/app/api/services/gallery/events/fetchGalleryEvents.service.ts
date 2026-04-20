import { GalleryEvent } from "@omenai/shared-models/models/events/GalleryEventSchema";

export async function fetchGalleryEvents(gallery_id: string) {
  try {
    const today = new Date();

    // Fetch all events for the gallery, sorted by start date (newest first)
    const allEvents = await GalleryEvent.find({ gallery_id })
      .sort({ start_date: -1 })
      .lean();

    if (!allEvents) {
      return { isOk: true, activeEvents: [], pastEvents: [] };
    }

    // Categorize events locally (faster than running two separate DB queries)
    const activeEvents = allEvents.filter(
      (event) => !event.is_archived && new Date(event.end_date) >= today,
    );

    const pastEvents = allEvents.filter(
      (event) => event.is_archived || new Date(event.end_date) < today,
    );

    return {
      isOk: true,
      activeEvents,
      pastEvents,
    };
  } catch (error) {
    console.error("Error fetching gallery events:", error);
    return {
      isOk: false,
      message: "Failed to load gallery programming.",
    };
  }
}
