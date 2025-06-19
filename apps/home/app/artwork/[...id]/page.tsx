import ArtworkPageWrapper from "./ArtworkPageWrapper";

export default async function Artwork_Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const slug = (await params).id;
  const request_param = decodeURIComponent(slug);

  if (slug === undefined) throw new Error("Something went wrong");

  return <ArtworkPageWrapper param={request_param} />;
}
