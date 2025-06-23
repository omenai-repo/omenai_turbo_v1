"use client";
import NextTopLoader from "nextjs-toploader";
import { useWindowSize } from "usehooks-ts";

import { adminNavigationActions } from "@omenai/shared-state-store/src/admin/AdminNavigationStore";
import { QueryProvider } from "@omenai/package-provider";
import Appbar from "./admin/dashboard/Appbar";
import { DeleteEditorialModal } from "./admin/dashboard/modal/DeleteEditorialModal";
import { UpdatePromotionalModal } from "./admin/dashboard/modal/UpdatePromotionalModal";
import NoMobileView from "./admin/dashboard/NoMobileView";
import PageLayout from "./admin/dashboard/PageLayout";
import { Toaster } from "sonner";
import { ClerkProvider } from "@clerk/nextjs";
import { auth_uri } from "@omenai/url-config/src/config";
export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { open } = adminNavigationActions();
  const { width } = useWindowSize();
  return (
    <div>
      {width <= 768 ? (
        <NoMobileView />
      ) : (
        <>
          <Toaster
            position="top-right"
            expand
            visibleToasts={3}
            closeButton
            duration={7000}
          />
          <div className=" w-full h-screen">
            <NextTopLoader color="#6246EA" height={6} />
            <ClerkProvider>
              <QueryProvider>
                <main className="flex h-full">
                  <div className="hidden md:block">
                    <PageLayout />
                  </div>

                  <div
                    className={`w-full ${
                      open ? "xl:ml-[19rem] md:ml-[15rem]" : "md:ml-[7rem] ml-0"
                    } relative duration-200`}
                  >
                    <Appbar />
                    <div className="h-auto rounded-lg relative my-5 px-5">
                      <UpdatePromotionalModal />
                      <DeleteEditorialModal />
                      {children}
                    </div>
                  </div>
                </main>
              </QueryProvider>
            </ClerkProvider>
          </div>
        </>
      )}
    </div>
  );
}
