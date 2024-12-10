"use client";
import NextTopLoader from "nextjs-toploader";
import { useWindowSize } from "usehooks-ts";

import { adminNavigationActions } from "@omenai/shared-state-store/src/admin/AdminNavigationStore";
import { QueryProvider, SessionProvider } from "@omenai/package-provider";

import { Toaster } from "sonner";
import { UserType } from "@omenai/shared-types";
import NoMobileView from "./gallery/components/NoMobileView";

export default function LayoutWrapper({
  children,
  session,
}: {
  children: React.ReactNode;
  session: UserType | undefined;
}) {
  const { width } = useWindowSize();
  return (
    <div>
      {width < 768 ? (
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
            <SessionProvider session={session}>
              <QueryProvider>{children}</QueryProvider>
            </SessionProvider>
          </div>
        </>
      )}
    </div>
  );
}
