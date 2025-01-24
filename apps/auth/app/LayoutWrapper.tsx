"use client";
import NextTopLoader from "nextjs-toploader";

import { QueryProvider, SessionProvider } from "@omenai/package-provider";

import { Toaster } from "sonner";
import { UserType } from "@omenai/shared-types";

export default function LayoutWrapper({
  children,
  session,
}: {
  children: React.ReactNode;
  session: UserType | undefined;
}) {
  return (
    <div>
      <>
        <Toaster
          position="top-right"
          expand
          visibleToasts={3}
          closeButton
          duration={7000}
        />
        <div className=" w-full h-screen">
          <NextTopLoader color="#1A1A1A" height={6} />
          <SessionProvider session={session}>
            <QueryProvider>{children}</QueryProvider>
          </SessionProvider>
        </div>
      </>
    </div>
  );
}
