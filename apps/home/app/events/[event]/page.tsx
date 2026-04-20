import React from "react";
import SingleFairEventPage from "./components/SingleFairEventWrapper";

export default async function page({
  params,
}: {
  params: Promise<{ event: string }>;
}) {
  const { event } = await params;
  return <SingleFairEventPage eventId={event} />;
}
