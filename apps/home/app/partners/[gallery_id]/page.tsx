import GalleryOverviewPage from "./components/OverviewPageWrapper";

export default async function page({
  params,
}: {
  params: Promise<{ gallery_id: string }>;
}) {
  const galleryId = (await params).gallery_id;
  return <GalleryOverviewPage galleryId={galleryId} />;
}
