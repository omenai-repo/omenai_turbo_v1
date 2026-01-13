"use client";
import NextTopLoader from "nextjs-toploader";

import { QueryProvider } from "@omenai/package-provider";

import { Toaster } from "sonner";
import { ClientSessionData } from "@omenai/shared-types";
import { AuthGuard } from "@omenai/package-provider/AuthGuard";

export default function LayoutWrapper({
  children,
  initialSessionData,
}: {
  children: React.ReactNode;
  initialSessionData: ClientSessionData | null;
}) {
  return (
    <div>
      <>
        <NextTopLoader color="#030303" height={6} />
        <Toaster
          position="top-center"
          expand
          visibleToasts={3}
          closeButton
          duration={7000}
        />
        <div className=" w-full h-screen">
          <QueryProvider>
            <AuthGuard initialData={initialSessionData}>{children}</AuthGuard>
          </QueryProvider>
        </div>
      </>
    </div>
  );
}
