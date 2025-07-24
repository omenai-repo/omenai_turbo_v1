"use client";
import NextTopLoader from "nextjs-toploader";
import PageLayout from "./features/PageLayout";
import Appbar from "./components/Appbar";
import { useWindowSize } from "usehooks-ts";
import { UploadOrderRejectionReason } from "./modals/ProvideOrderRejectionReason";
import { DeleteAccountConfirmationModal } from "./modals/DeleteAccountConfirmationMdal";
import { UpdatePasswordModal } from "./modals/UpdatePasswordModal";
import { WithdrawalModal } from "./modals/WithdrawalModal";
import { WalletPinModal } from "./modals/WalletPinModal";
import NoMobileView from "../../components/NoMobileView";
import VerificationBlockerModal from "./modals/VerificationModalBlocker";

import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import React from "react";
import { useRouter } from "next/navigation";

export default function ArtistDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth({
    requiredRole: "artist",
  });
  const router = useRouter();

  const { width } = useWindowSize();

  if (!user.isOnboardingCompleted) router.replace("/artist/onboarding");
  return (
    <>
      {width <= 1280 ? (
        <NoMobileView />
      ) : (
        <div className=" w-full h-full">
          <NextTopLoader color="#1a1a1a" height={6} />
          <VerificationBlockerModal
            open={user && user.role === "artist" && !user.artist_verified}
          />
          <main className="flex h-full">
            <PageLayout />

            <div
              className={`w-full xl:ml-[19rem] md:ml-[15rem]  rounded-xl relative duration-200`}
            >
              <Appbar />
              <div className="h-auto rounded-lg relative my-5">
                <UploadOrderRejectionReason />
                <UpdatePasswordModal />
                <DeleteAccountConfirmationModal />
                <WithdrawalModal />
                <WalletPinModal />

                {children}
              </div>
            </div>
          </main>
        </div>
      )}
    </>
  );
}
