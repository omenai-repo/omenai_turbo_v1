import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import QueryProvider from "@omenai/package-provider/QueryProvider";
import LoginModal from "@omenai/shared-ui-components/components/modal/LoginModal";
import RecoveryModal from "@omenai/shared-ui-components/components/modal/RecoveryModal";
import { OrderReceivedModal } from "@omenai/shared-ui-components/components/modal/OrderConfirmedModal";
import { Toaster } from "sonner";
import type { Viewport } from "next";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import { HighlightInit } from "@highlight-run/next/client";
import {
  ColorSchemeScript,
  MantineProvider,
  mantineHtmlProps,
} from "@mantine/core";
import { ClerkProvider } from "@clerk/nextjs";
import { auth_uri } from "@omenai/url-config/src/config";
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};
const dm_sans = Poppins({
  subsets: ["latin"],
  variable: "--font-sans_serif",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Omenai",
  description: "Omenai Home",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <HighlightInit
        projectId={"ng2zpqyg"}
        serviceName="Omenai root domain"
        tracingOrigins
        networkRecording={{
          enabled: true,
          recordHeadersAndBody: true,
          urlBlocklist: [],
        }}
      />
      <html lang="en" {...mantineHtmlProps}>
        <head>
          <ColorSchemeScript />
        </head>
        <body className={`${dm_sans.className} flex flex-col justify-center`}>
          <NextTopLoader color="#1A1A1A" height={6} />
          <Toaster
            position="top-right"
            expand
            visibleToasts={3}
            closeButton
            duration={7000}
          />
          <ClerkProvider
            publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
            appearance={{
              baseTheme: undefined, // Since you're using custom pages
            }}
            // This enables cross-subdomain session sharing
            domain={process.env.NEXT_PUBLIC_CLERK_DOMAIN as string}
            isSatellite={true}
            signInUrl={`${auth_uri()}/login`}
            // signUpUrl={`${auth_uri()}/register`}
          >
            <QueryProvider>
              <MantineProvider>
                <LoginModal />
                <RecoveryModal />
                <OrderReceivedModal />
                <div className="2xl:px-16 xl:px-8 px-4">{children}</div>
                <Analytics />
              </MantineProvider>
            </QueryProvider>
          </ClerkProvider>
        </body>
      </html>
    </>
  );
}
