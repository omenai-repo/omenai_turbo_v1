import DesktopNavbar from "@omenai/shared-ui-components/components/navbar/desktop/DesktopNavbar";
import NextTopLoader from "nextjs-toploader";
import Banner from "./LayoutDesign/Banner";
import Navbar from "./LayoutDesign/Navbar";
import { UpdatePasswordModal } from "./modals/UpdatePasswordModal";
import { DeleteAccountConfirmationModal } from "./modals/DeleteAccountConfirmationMdal";
import { ConfirmOrderDeliveryModal } from "./modals/ConfirmOrderDeliveryModal";
import Sidebar from "./LayoutDesign/Sidebar";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <NextTopLoader color="#0f172a" height={6} />

      <main className="relative h-dvh flex flex-col">
        <Navbar />
        <UpdatePasswordModal />
        <DeleteAccountConfirmationModal />
        <ConfirmOrderDeliveryModal />
        <div className="lg:grid grid-cols-10 gap-8 flex-1 min-h-0">
          <Sidebar />
          <div className="col-start-3 col-end-11 h-full overflow-y-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
