"use client";
import NextTopLoader from "nextjs-toploader";
import PageLayout from "./features/PageLayout";
import Appbar from "./components/Appbar";
import { useWindowSize } from "usehooks-ts";

import { UploadOrderRejectionReason } from "./modals/ProvideOrderRejectionReason";
import { DeleteAccountConfirmationModal } from "./modals/DeleteAccountConfirmationMdal";
import { UpdatePasswordModal } from "./modals/UpdatePasswordModal";
import { useContext } from "react";
import {
  SessionContext,
  useSession,
} from "@omenai/package-provider/SessionProvider";
import { useRouter } from "next/navigation";
import { auth_uri } from "@omenai/url-config/src/config";
import { WithdrawalModal } from "./modals/WithdrawalModal";
import { WalletPinModal } from "./modals/WalletPinModal";
import NoMobileView from "../../components/NoMobileView";
import VerificationBlockerModal from "./modals/VerificationModalBlocker";
import { ArtistSchemaTypes } from "@omenai/shared-types";

export default function GalleryDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = useSession() as ArtistSchemaTypes;
  const { width } = useWindowSize();
  const router = useRouter();

  if (session === undefined) {
    router.replace(`${auth_uri()}/login`);
  }

  return (
    <>
      {width <= 1280 ? (
        <NoMobileView />
      ) : (
        <div className=" w-full h-full">
          <NextTopLoader color="#1A1A1A" height={6} />
          <VerificationBlockerModal open={!session.artist_verified} />
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
