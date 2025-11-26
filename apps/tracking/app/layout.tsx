import type { Metadata } from "next";
import { Work_Sans } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import QueryProvider from "@omenai/package-provider/QueryProvider";
import { Toaster } from "sonner";
import type { Viewport } from "next";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import {
  ColorSchemeScript,
  MantineProvider,
  mantineHtmlProps,
} from "@mantine/core";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import { SessionProvider } from "@omenai/package-provider";
import { getServerSession } from "@omenai/shared-lib/session/getServerSession";
import { LowRiskProvider } from "@omenai/package-provider/ConfigCatProvider";
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};
import "leaflet/dist/leaflet.css";

import { Provider as RollbarProvider } from "@rollbar/react";
import { clientConfig } from "@omenai/rollbar-config";

export const metadata: Metadata = {
  title: "Omenai Tracking",
  description:
    "Omenai Tracking - Track Your Delivery, Shipment, and Order Updates",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

// Body font → work_sans
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
      <LowRiskProvider>
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
                <MantineProvider
                  defaultColorScheme="light"
                  forceColorScheme="light"
                >
                  {children}
                  <Analytics />
                </MantineProvider>
              </QueryProvider>
            </SessionProvider>
          </body>
        </html>
      </LowRiskProvider>
    </RollbarProvider>
  );
}
