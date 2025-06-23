"use client";
import NextTopLoader from "nextjs-toploader";

import { QueryProvider } from "@omenai/package-provider";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import {
  admin_url,
  base_url,
  dashboard_url,
} from "@omenai/url-config/src/config";

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
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
          <ClerkProvider
            appearance={{
              baseTheme: undefined, // Since you're using custom pages
            }}
            allowedRedirectOrigins={[
              `${dashboard_url()}`,
              `${base_url()}`,
              `${admin_url()}`,
            ]}
          >
            <QueryProvider>{children}</QueryProvider>
          </ClerkProvider>
        </div>
      </>
    </div>
  );
}
