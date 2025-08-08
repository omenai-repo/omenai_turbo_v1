"use client";
import NextTopLoader from "nextjs-toploader";
import PageLayout from "./features/PageLayout";
import Appbar from "./components/Appbar";
import { useWindowSize } from "usehooks-ts";
import NoMobileView from "../components/NoMobileView";
import { UploadOrderRejectionReason } from "./modals/ProvideOrderRejectionReason";
import { DeleteAccountConfirmationModal } from "./modals/DeleteAccountConfirmationMdal";
import { UpdatePasswordModal } from "./modals/UpdatePasswordModal";
import GetStartedWithStripe from "./modals/GetStartedWithStripe";
import { useQuery } from "@tanstack/react-query";
import { getAccountId } from "@omenai/shared-services/stripe/getAccountId";
import { toast } from "sonner";
import { HomeLoad } from "@omenai/shared-ui-components/components/loader/Load";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
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
      const acc = await getAccountId(user.email as string, csrf || "");
      if (!acc?.isOk) {
        toast.error("Error notification", {
          description: "Something went wrong, Please refresh the page",
          style: {
            background: "red",
            color: "white",
          },
          className: "class",
        });
      } else return acc.data;
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
      {width < 1024 ? (
        <NoMobileView />
      ) : (
        <div className=" w-full h-full">
          <NextTopLoader color="#0f172a" height={6} />
          <main className="flex h-full">
            <PageLayout />

            <div
              className={`w-full xl:ml-[19rem] md:ml-[15rem]  rounded-xl relative duration-200`}
            >
              <Appbar />
              <div className="h-auto rounded-lg relative my-5">
                {val ? (
                  <GetStartedWithStripe />
                ) : (
                  <>
                    <UploadOrderRejectionReason />
                    <UpdatePasswordModal />
                    <DeleteAccountConfirmationModal />

                    {children}
                  </>
                )}
              </div>
            </div>
          </main>
        </div>
      )}
    </>
  );
}
