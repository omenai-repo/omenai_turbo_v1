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
    <div className="2xl:px-12 xl:px-8">
      <NextTopLoader color="#0f172a" height={6} />

      <main className="relative">
        <NavigationChipTabs />
        <UpdatePasswordModal />
        <DeleteAccountConfirmationModal />
        <ConfirmOrderDeliveryModal />

        {children}
      </main>
    </div>
  );
}
