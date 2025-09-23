import type { Metadata } from "next";
import { Cormorant_Garamond, Work_Sans } from "next/font/google";
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
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import { SessionProvider } from "@omenai/package-provider";
import { getServerSession } from "@omenai/shared-lib/session/getServerSession";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

// Body font → work_sans
const work_sans = Work_Sans({
  subsets: ["latin"],
  variable: "--font-work_sans",
  display: "swap",
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
  const initialSessionData = await getServerSession();

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
        <body
          className={`${work_sans.variable} flex flex-col justify-center`}
        >
          <NextTopLoader color="#0f172a" height={6} />
          <Toaster
            position="top-right"
            expand
            visibleToasts={3}
            closeButton
            duration={7000}
          />
          <SessionProvider initialSessionData={initialSessionData}>
            <QueryProvider>
              <MantineProvider>
                <LoginModal />
                <RecoveryModal />
                <OrderReceivedModal />
                <div className="2xl:px-16 xl:px-8 px-4">{children}</div>
                <Analytics />
              </MantineProvider>
            </QueryProvider>
          </SessionProvider>
        </body>
      </html>
    </>
  );
}
