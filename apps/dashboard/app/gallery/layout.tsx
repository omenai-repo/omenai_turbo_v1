"use client";
import NextTopLoader from "nextjs-toploader";
import { useWindowSize } from "usehooks-ts";
import { UploadOrderRejectionReason } from "./modals/ProvideOrderRejectionReason";
import { DeleteAccountConfirmationModal } from "./modals/DeleteAccountConfirmationMdal";
import { UpdatePasswordModal } from "./modals/UpdatePasswordModal";
import GetStartedWithStripe from "./modals/GetStartedWithStripe";
import { useQuery } from "@tanstack/react-query";
import { getAccountId } from "@omenai/shared-services/stripe/getAccountId";
import { HomeLoad } from "@omenai/shared-ui-components/components/loader/Load";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { UpdateAddressModal } from "./modals/UpdateAddressModal";
import { UpdateLogoModal } from "./modals/UpdateLogoModal";
import { toast_notif } from "@omenai/shared-utils/src/toast_notification";
import NoMobileView from "../artist/components/NoMobileView";
import { DesktopSidebar } from "./features/Sidebar";
import { MobileSidebar } from "./features/MobileLayout";
import { MainContent } from "./features/MainContent";
export default function GalleryDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, csrf } = useAuth({ requiredRole: "gallery" });
  const { width } = useWindowSize();

  const { data: account, isLoading } = useQuery({
    queryKey: ["get_account_info"],
    queryFn: async () => {
      const acc = await getAccountId(user.gallery_id as string, csrf || "");

      console.log(acc);
      if (!acc?.isOk)
        toast_notif("Something went wrong, Please refresh the page", "error");
      else return acc.data;
    },
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return <HomeLoad />;
  }

  const isNotStripeConnected = account.connected_account_id === null;
  const isGalleryVerified = account.gallery_verified;
  const val = isNotStripeConnected && isGalleryVerified;

  return (
    <>
      {width < 1280 ? (
        <NoMobileView />
      ) : (
        <div className="flex h-screen overflow-hidden">
          <NextTopLoader color="#0f172a" height={6} />

          <DesktopSidebar />

          <div className="flex flex-1 flex-col md:ml-16">
            {/* Mobile header */}
            <header className="flex items-center gap-4 border-b bg-white px-4 py-3 md:hidden">
              <MobileSidebar />
              <span className="text-sm font-medium">Dashboard</span>
            </header>

            <MainContent>
              {val ? (
                <GetStartedWithStripe />
              ) : (
                <>
                  <UploadOrderRejectionReason />
                  <UpdatePasswordModal />
                  <DeleteAccountConfirmationModal />
                  <UpdateAddressModal />
                  <UpdateLogoModal />

                  {children}
                </>
              )}
            </MainContent>
          </div>
        </div>
      )}
    </>
  );
}
