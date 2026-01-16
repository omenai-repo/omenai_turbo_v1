"use client";
import NextTopLoader from "nextjs-toploader";
import { UploadOrderRejectionReason } from "./modals/ProvideOrderRejectionReason";
import { DeleteAccountConfirmationModal } from "./modals/DeleteAccountConfirmationMdal";
import { UpdatePasswordModal } from "./modals/UpdatePasswordModal";
import { WithdrawalModal } from "./modals/WithdrawalModal";
import { WalletPinModal } from "./modals/WalletPinModal";
import VerificationBlockerModal from "./modals/VerificationModalBlocker";

import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { ClientSessionData } from "@omenai/shared-types";
import {
  getApiUrl,
  base_url,
  auth_uri,
  dashboard_url,
} from "@omenai/url-config/src/config";
import { useRouter } from "next/navigation";
import Load from "@omenai/shared-ui-components/components/loader/Load";
import { UpdateAddressModal } from "./modals/UpdateAddressModal";
import { UpdateLogoModal } from "./modals/UpdateLogoModal";
import { ExtendArtworkContractModal } from "./modals/ExtendArtworkContractModal";
import NoMobileView from "../components/NoMobileView";
import { MainContent } from "./features/MainContent";
import { MobileSidebar } from "./features/MobileLayout";
import { DesktopSidebar } from "./features/Sidebar";
import { useWindowSize } from "usehooks-ts";
import { GalleryOverviewSkeleton } from "@omenai/shared-ui-components/components/skeletons/GalleryOverviewSkeleton";

export default function ArtistDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user } = useAuth({ requiredRole: "artist" });

  const { width } = useWindowSize();
  const { data, isLoading: loading } = useQuery({
    queryKey: ["check_onboarding_completion"],
    queryFn: async () => {
      const res = await fetch(
        `${getApiUrl()}/api/requests/artist/verifyOnboardingCompletion?id=${user.artist_id}`,
        {
          headers: {
            "Content-Type": "application/json",
            Origin: base_url(),
          },
          credentials: "include",
        }
      );
      if (!res.ok) {
        console.error("Failed to Artist onboarding status:");
        return null;
      }
      const result = await res.json();
      return {
        isOnboardingCompleted: result.isOnboardingCompleted,
        isArtistVerified: result.isArtistVerified,
      };
    },
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });

  if (loading) return <GalleryOverviewSkeleton />;

  if (!data || data.isOnboardingCompleted === null)
    router.replace(`${auth_uri()}/login`);

  if (data && !data.isOnboardingCompleted)
    router.replace(`${dashboard_url()}/artist/onboarding`);

  return (
    <>
      {width < 1280 ? (
        <NoMobileView />
      ) : (
        <div className="flex h-screen overflow-hidden">
          <NextTopLoader color="#0f172a" height={6} />
          <VerificationBlockerModal
            open={user && user.role === "artist" && !data?.isArtistVerified}
          />

          <div className="flex flex-1 flex-col md:ml-16">
            <DesktopSidebar />
            {/* Mobile header */}
            <header className="flex items-center gap-x-4 border-b bg-white px-4 py-3 md:hidden">
              <MobileSidebar />
              <span className="text-sm font-medium">Dashboard</span>
            </header>

            <MainContent>
              <div className="h-auto rounded relative my-5">
                <UploadOrderRejectionReason />
                <UpdatePasswordModal />
                <DeleteAccountConfirmationModal />
                <WithdrawalModal />
                <WalletPinModal />
                <UpdateAddressModal />
                <UpdateLogoModal />
                <ExtendArtworkContractModal />

                {children}
              </div>
            </MainContent>
          </div>
        </div>
      )}
    </>
  );
}
