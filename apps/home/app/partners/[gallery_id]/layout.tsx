import Footer from "@omenai/shared-ui-components/components/footer/Footer";
import AppStoreAd from "../../features/appStoreAd/AppStoreAd";
import Newsletter from "../../Newsletter";
import GalleryWrapper from "./components/GalleryWrapper";
import DesktopNavbar from "@omenai/shared-ui-components/components/navbar/desktop/DesktopNavbar";

export default async function GalleryProfileLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ gallery_id: string }>;
}) {
  const galleryId = (await params).gallery_id;

  return (
    <main className="min-h-screen bg-white">
      <DesktopNavbar />
      {/* Renders once, stays locked during tab navigation */}
      <GalleryWrapper galleryId={galleryId} />
      {/* The nested routes (Overview, Works, Shows) will inject here seamlessly */}
      <div className="w-full bg-white min-h-[50vh]">{children}</div>
      <AppStoreAd />
      <Newsletter />
      <Footer />
    </main>
  );
}
