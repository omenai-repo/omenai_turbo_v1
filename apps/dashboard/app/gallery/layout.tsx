"use client";
import NextTopLoader from "nextjs-toploader";
import { useWindowSize } from "usehooks-ts";
import { UploadOrderRejectionReason } from "./modals/ProvideOrderRejectionReason";
import { DeleteAccountConfirmationModal } from "./modals/DeleteAccountConfirmationMdal";
import { UpdatePasswordModal } from "./modals/UpdatePasswordModal";
import GetStartedWithStripe from "./modals/GetStartedWithStripe";
import { useQuery } from "@tanstack/react-query";
import { getAccountId } from "@omenai/shared-services/stripe/getAccountId";
import Load from "@omenai/shared-ui-components/components/loader/Load";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { UpdateAddressModal } from "./modals/UpdateAddressModal";
import { UpdateLogoModal } from "./modals/UpdateLogoModal";
import { toast_notif } from "@omenai/shared-utils/src/toast_notification";
import NoMobileView from "../artist/components/NoMobileView";
import { DesktopSidebar } from "./features/Sidebar";
import { MobileSidebar } from "./features/MobileLayout";
import { MainContent } from "./features/MainContent";
import { GlobalCommandMenu } from "./features/GlobalCommandMenu";
import VerificationBlockerModal from "./components/VerificationBlocker";
import { useDeviceBlock } from "@omenai/shared-hooks/hooks/useDeviceBlock";

export default function GalleryDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, csrf } = useAuth({ requiredRole: "gallery" });
  const { shouldBlock, isMounted } = useDeviceBlock();

  const {
    data: account,
    isPending,
    isLoading,
  } = useQuery({
    queryKey: ["get_account_info", user?.gallery_id, csrf],
    queryFn: async () => {
      if (!user?.gallery_id) return null;

      const acc = await getAccountId(user.gallery_id as string, csrf || "");

      if (!acc?.isOk) {
        toast_notif("Something went wrong, Please refresh the page", "error");
        return null;
      }
      return acc.data;
    },
    refetchOnWindowFocus: false,
    enabled: !!user?.gallery_id && !!csrf && !shouldBlock,
  });

  if (!isMounted) {
    return null;
  }

  if (shouldBlock) {
    return <NoMobileView />;
  }

  // 3. Handle data loading states
  if (isPending || isLoading || account === undefined) {
    return <Load />;
  }

  // 4. Safe derivations since we know 'account' is loaded
  const isNotStripeConnected = account?.connected_account_id === null;
  const isGalleryVerified = account?.gallery_verified === true;
  const val = isNotStripeConnected && isGalleryVerified;

  return (
    <>
      {!isGalleryVerified && (
        <VerificationBlockerModal open={!isGalleryVerified} />
      )}

      <div className="flex h-full overflow-hidden">
        <NextTopLoader color="#0f172a" height={6} />

        <DesktopSidebar />
        <GlobalCommandMenu />

        <div className="flex flex-1 flex-col md:ml-64">
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
    </>
  );
}
