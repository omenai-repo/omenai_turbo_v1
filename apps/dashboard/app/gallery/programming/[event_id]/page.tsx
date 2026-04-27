// app/gallery/programming/[event_id]/page.tsx

import React from "react";
import { EventDashboardClient } from "./EventDashboardClient";

export default async function EventManagementPage({
  params,
}: {
  params: Promise<{ event_id: string }>;
}) {
  // Await the entire params object first
  const { event_id } = await params;

  return <EventDashboardClient eventId={event_id} />;
}
