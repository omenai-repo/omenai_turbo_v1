import ShowDetailsWrapper from "./ShowDetailsWrapper";

export default async function IndividualShowPage({
  params,
}: {
  params: Promise<{ event_id: string }>;
}) {
  const { event_id } = await params;
  return <ShowDetailsWrapper eventId={event_id} />;
}
