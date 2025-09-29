"use client";
import NextTopLoader from "nextjs-toploader";
import PageLayout from "./features/PageLayout";
import Appbar from "./components/Appbar";
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

export default function ArtistDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user } = useAuth({ requiredRole: "artist" });


  const { data, isLoading: loading } = useQuery({
    queryKey: ["check_onboarding_completion"],
    queryFn: async () => {
      const res = await fetch(`${getApiUrl()}/api/requests/artist/verifyOnboardingCompletion?id=${user.artist_id}`, {
        headers: {
          "Content-Type": "application/json",
          Origin: base_url(),
        },
        credentials: "include",
      });
      if (!res.ok) {
        console.error(
          "Failed to Artist onboarding status:",
        );
        return null;
      }
      const result = await res.json();
      return {
        isOnboardingCompleted: result.isOnboardingCompleted,
        isArtistVerified: result.isArtistVerified
      }
    },
    staleTime: 0,
    gcTime: 0
  });

  if (loading) return <Load />;
  


  if (!data || data.isOnboardingCompleted === null) router.replace(`${auth_uri()}/login`);

  if (data && !data.isOnboardingCompleted) router.replace(`${dashboard_url()}/artist/onboarding`);

  return (
    <>
      <div className=" w-full h-full">
        <NextTopLoader color="#0f172a" height={6} />
        <VerificationBlockerModal
          open={user && user.role === "artist" && !data?.isArtistVerified}
        />
        <main className="flex h-full">
          <PageLayout />

          <div
            className={`w-full xl:ml-[19rem] md:ml-[15rem]  rounded relative duration-200`}
          >
            <Appbar />
            <div className="h-auto rounded relative my-5">
              <UploadOrderRejectionReason />
              <UpdatePasswordModal />
              <DeleteAccountConfirmationModal />
              <WithdrawalModal />
              <WalletPinModal />
              <UpdateAddressModal />
              <UpdateLogoModal />

              {children}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
