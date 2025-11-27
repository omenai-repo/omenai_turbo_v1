// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { Work_Sans } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import QueryProvider from "@omenai/package-provider/QueryProvider";
import LoginModal from "@omenai/shared-ui-components/components/modal/LoginModal";
import RecoveryModal from "@omenai/shared-ui-components/components/modal/RecoveryModal";
import { OrderReceivedModal } from "@omenai/shared-ui-components/components/modal/OrderConfirmedModal";
import { Toaster } from "sonner";
import { Provider as RollbarProvider } from "@rollbar/react";
import { clientConfig } from "@omenai/rollbar-config";
import { Analytics } from "@vercel/analytics/react";
import {
  ColorSchemeScript,
  MantineProvider,
  mantineHtmlProps,
} from "@mantine/core";
import { SessionProvider } from "@omenai/package-provider";
import { getServerSession } from "@omenai/shared-lib/session/getServerSession";
import { HighRiskProvider } from "@omenai/package-provider/ConfigCatProvider";

import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";

import SmoothScroll from "@omenai/package-provider/ScrollProvider";
import LenisProvider from "@omenai/package-provider/ScrollProvider";

export const metadata: Metadata = {
  title: "Omenai",
  description: "Discover, buy, and sell African contemporary art online.",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "Omenai – African Art Marketplace",
    description: "Discover, buy, and sell African contemporary art online.",
    url: "https://omenai.app",
  },
  manifest: "/site.webmanifest",
};

// Font
const work_sans = Work_Sans({
  subsets: ["latin"],
  variable: "--font-work_sans",
  display: "swap",
});

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const initialSessionData = await getServerSession();

  return (
    <RollbarProvider config={clientConfig}>
      <HighRiskProvider>
        <html lang="en" {...mantineHtmlProps}>
          <head>
            <meta name="color-scheme" content="light" />
            <ColorSchemeScript defaultColorScheme="light" />

            {/* Favicon fallback for localhost/dev */}
            <link rel="icon" href="/favicon.ico" />
            <link rel="shortcut icon" href="/favicon.ico" />
            <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
          </head>
          <body
            className={`${work_sans.variable} font-sans flex flex-col justify-center`}
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
                <MantineProvider
                  defaultColorScheme="light"
                  forceColorScheme="light"
                >
                  <LoginModal />
                  <RecoveryModal />
                  <OrderReceivedModal />
                  <LenisProvider>
                    <div className="2xl:px-16 xl:px-8 px-4">{children}</div>
                  </LenisProvider>
                  <Analytics />
                </MantineProvider>
              </QueryProvider>
            </SessionProvider>
          </body>
        </html>
      </HighRiskProvider>
    </RollbarProvider>
  );
}
