"use client";
import { useQuery } from "@tanstack/react-query";
import { notFound } from "next/navigation";
import React from "react";
import { ShowDetailsClient } from "./ShowDetailsClient";
import { ShowDetailsSkeleton } from "./ShowDetailsSkeleton";
import { getIndividualShow } from "@omenai/shared-services/events/getIndividualShow";
export default function ShowDetailsWrapper({ eventId }: { eventId: string }) {
  const {
    data: show,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["individualShow", eventId],
    queryFn: async () => {
      const show = await getIndividualShow(eventId);
      console.log(show);
      if (!show.isOk) {
        notFound();
      }
      return show.data;
    },
    retry: 1, // Only retry once to avoid hanging the user if a show is genuinely deleted
  });

  if (isLoading) {
    return <ShowDetailsSkeleton />;
  }

  // If the fetch fails or returns null, Next.js will hijack the render and show the 404 page
  if (isError || !show) {
    notFound();
  }

  return <ShowDetailsClient show={show} />;
}
