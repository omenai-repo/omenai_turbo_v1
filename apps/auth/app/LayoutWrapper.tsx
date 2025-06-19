"use client";
import NextTopLoader from "nextjs-toploader";

import { QueryProvider } from "@omenai/package-provider";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";

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
            publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
            appearance={{
              baseTheme: undefined, // Since you're using custom pages
            }}
            // This enables cross-subdomain session sharing
            domain={process.env.NEXT_PUBLIC_CLERK_DOMAIN as string}
            isSatellite={false}
          >
            <QueryProvider>{children}</QueryProvider>
          </ClerkProvider>
        </div>
      </>
    </div>
  );
}
