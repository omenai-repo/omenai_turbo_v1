import GalleryWorksPage from "./GalleryWorksWrapper";

export default async function page({
  params,
}: {
  params: Promise<{ gallery_id: string }>;
}) {
  const { gallery_id } = await params;
  return <GalleryWorksPage galleryId={gallery_id} />;
}
