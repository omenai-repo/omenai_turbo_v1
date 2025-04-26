"use client";
import NextTopLoader from "nextjs-toploader";
import PageLayout from "./features/PageLayout";
import Appbar from "./components/Appbar";
import { useWindowSize } from "usehooks-ts";
import NoMobileView from "./components/NoMobileView";
import { OrderActionModal } from "./modals/OrderActionModal";
import { UploadTrackingIDModal } from "./modals/ProvideTrackingIDModal";
import { UploadOrderRejectionReason } from "./modals/ProvideOrderRejectionReason";
import { DeleteAccountConfirmationModal } from "./modals/DeleteAccountConfirmationMdal";
import { UpdatePasswordModal } from "./modals/UpdatePasswordModal";
import { useContext } from "react";
import { SessionContext } from "@omenai/package-provider/SessionProvider";
import { useRouter } from "next/navigation";
import { auth_uri } from "@omenai/url-config/src/config";

export default function GalleryDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session } = useContext(SessionContext);
  const { width } = useWindowSize();
  const router = useRouter();

  if (session === undefined) {
    router.replace(`${auth_uri()}/login`);
  }

  return (
    <>
      {width < 991 ? (
        <NoMobileView />
      ) : (
        <div className=" w-full h-full">
          <NextTopLoader color="#1A1A1A" height={6} />
          <main className="flex h-full">
            <PageLayout />

            <div
              className={`w-full xl:ml-[19rem] md:ml-[15rem]  rounded-xl relative duration-200`}
            >
              <Appbar />
              <div className="h-auto rounded-lg relative my-5 px-5">
                <OrderActionModal />
                <UploadTrackingIDModal />
                <UploadOrderRejectionReason />
                <UpdatePasswordModal />
                <DeleteAccountConfirmationModal />

                {children}
              </div>
            </div>
          </main>
        </div>
      )}
    </>
  );
}
