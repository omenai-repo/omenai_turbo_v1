import GalleryDetailPopupModal from "./components/GalleryDetailPopupModal";
import TabGroup from "./components/TabGroup";
import AcceptConfirmationPopupModal from "./components/AcceptGalleryConfirmationPopup";
import RejectConfirmationPopupModal from "./components/RejectGalleryConfirmationModal";
import BlockGalleryConfirmationPopupModal from "./components/BlockGalleryConfirmationPopup";

export default function page() {
  return (
    <div className="relative">
      <TabGroup />
      <GalleryDetailPopupModal />
      <AcceptConfirmationPopupModal />
      <RejectConfirmationPopupModal />
      <BlockGalleryConfirmationPopupModal />
    </div>
  );
}
