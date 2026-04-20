// app/fairs-events/[event_id]/page.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { notFound } from "next/navigation";
import { FairEventDetailsClient } from "./FairEventDetailsClient";
import { FairEventSkeleton } from "./FairEventSkeleton";
import { getEvent } from "@omenai/shared-services/events/getSingleEvent";
const fetchEvent = async (id: string) => {
  const res = await getEvent(id);
  if (!res.isOk) throw new Error("Event not found");
  return res.data;
};

export default function SingleFairEventPage({ eventId }: { eventId: string }) {
  const {
    data: event,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["fairEvent", eventId],
    queryFn: () => fetchEvent(eventId),
    staleTime: 1000 * 60 * 10,
  });

  if (isLoading) return <FairEventSkeleton />;
  if (isError || !event) return notFound();

  return <FairEventDetailsClient event={event} />;
}
