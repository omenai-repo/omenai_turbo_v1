import DesktopNavbar from "@omenai/shared-ui-components/components/navbar/desktop/DesktopNavbar";
import NextTopLoader from "nextjs-toploader";
import Banner from "./LayoutDesign/Banner";
import NavigationChipTabs from "./LayoutDesign/NavigationTabs";
import { UpdatePasswordModal } from "./modals/UpdatePasswordModal";
import { DeleteAccountConfirmationModal } from "./modals/DeleteAccountConfirmationMdal";
import { ConfirmOrderDeliveryModal } from "./modals/ConfirmOrderDeliveryModal";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="2xl:px-12 xl:px-8 px-4">
      <NextTopLoader color="#1A1A1A" height={6} />

      <DesktopNavbar />

      <main className="relative">
        <div className="sticky top-0 left-0 bg-white z-20">
          <Banner />
          <NavigationChipTabs />
        </div>
        <UpdatePasswordModal />
        <DeleteAccountConfirmationModal />
        <ConfirmOrderDeliveryModal />

        {children}
      </main>
    </div>
  );
}
