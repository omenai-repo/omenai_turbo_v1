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
  const { data: isOnboardingCompleted, isLoading: loading } = useQuery({
    queryKey: ["check_user_session"],
    queryFn: async () => {
      const res = await fetch(`${getApiUrl()}/api/auth/session/user`, {
        headers: {
          "Content-Type": "application/json",
          Origin: base_url(),
        },
        credentials: "include",
      });
      if (!res.ok) {
        console.error(
          "Failed to fetch session data:",
          res.status,
          res.statusText
        );
        return null;
      }
      const { user } = await res.json();
      return user.userData.isOnboardingCompleted;
    },
  });

  if (loading) return <Load />;

  if (isOnboardingCompleted === null) router.replace(`${auth_uri()}/login`);

  if (!isOnboardingCompleted) router.replace(`${dashboard_url()}/onboarding`);
  return (
    <>
      <div className=" w-full h-full">
        <NextTopLoader color="#0f172a" height={6} />
        <VerificationBlockerModal
          open={user && user.role === "artist" && !user.artist_verified}
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
