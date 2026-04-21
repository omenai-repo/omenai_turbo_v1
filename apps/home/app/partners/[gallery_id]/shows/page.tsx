import GalleryShowsPage from "./GalleryShowsEvents";

export default async function page({
  params,
}: {
  params: Promise<{ gallery_id: string }>;
}) {
  const { gallery_id } = await params;
  return <GalleryShowsPage galleryId={gallery_id} />;
}
