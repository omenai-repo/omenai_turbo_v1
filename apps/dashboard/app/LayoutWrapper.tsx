"use client";
import NextTopLoader from "nextjs-toploader";

import { QueryProvider } from "@omenai/package-provider";

import { Toaster } from "sonner";
import { ClerkProvider } from "@clerk/nextjs";
import { auth_uri } from "@omenai/url-config/src/config";

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
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
          <ClerkProvider>
            <QueryProvider>{children}</QueryProvider>
          </ClerkProvider>
        </div>
      </>
    </div>
  );
}
