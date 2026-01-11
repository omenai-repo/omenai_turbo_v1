import "./globals.css";
import LayoutWrapper from "./LayoutWrapper";
import { Analytics } from "@vercel/analytics/react";

import {
  ColorSchemeScript,
  MantineProvider,
  mantineHtmlProps,
} from "@mantine/core";
import { Work_Sans } from "next/font/google";

import { HighRiskProvider } from "@omenai/package-provider/ConfigCatProvider";

import { getServerSession } from "@omenai/shared-lib/session/getServerSession";
import { SessionProvider } from "@omenai/package-provider";
import { AuthGuard } from "@omenai/package-provider/AuthGuard";
import { Metadata, Viewport } from "next";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import { clientConfig } from "@omenai/rollbar-config";
import { Provider as RollbarProvider } from "@rollbar/react";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "Omenai Dashboard",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  robots: {
    index: false,
    follow: false,
  },
  manifest: "/site.webmanifest",
};

// Body font → work_sans
const work_sans = Work_Sans({
  subsets: ["latin"],
  variable: "--font-work_sans",
  display: "swap",
});

export default async function DashboardRootLayout({
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
            className={`${work_sans.variable} font-sans flex flex-col px-4 justify-center`}
          >
            <SessionProvider initialSessionData={initialSessionData}>
              <MantineProvider
                defaultColorScheme="light"
                forceColorScheme="light"
              >
                <LayoutWrapper
                  children={children}
                  initialSessionData={initialSessionData}
                />
              </MantineProvider>
            </SessionProvider>
            <Analytics />
          </body>
        </html>
      </HighRiskProvider>
    </RollbarProvider>
  );
}
