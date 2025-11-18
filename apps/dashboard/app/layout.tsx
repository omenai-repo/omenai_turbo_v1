import "./globals.css";
import LayoutWrapper from "./LayoutWrapper";
import { Analytics } from "@vercel/analytics/react";

import {
  ColorSchemeScript,
  MantineProvider,
  mantineHtmlProps,
} from "@mantine/core";
import { Work_Sans } from "next/font/google";

import {
  HighRiskProvider,
  LowRiskProvider,
} from "@omenai/package-provider/ConfigCatProvider";

import { getServerSession } from "@omenai/shared-lib/session/getServerSession";
import { SessionProvider } from "@omenai/package-provider";
import { Viewport } from "next";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";

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

export default async function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const initialSessionData = await getServerSession();
  return (
    <HighRiskProvider>
      <html lang="en" {...mantineHtmlProps}>
        <head>
          <meta name="color-scheme" content="light" />
          <ColorSchemeScript defaultColorScheme="light" />
        </head>
        <body
          className={`${work_sans.variable} font-sans flex flex-col px-4 justify-center`}
        >
          <SessionProvider initialSessionData={initialSessionData}>
            <MantineProvider
              defaultColorScheme="light"
              forceColorScheme="light"
            >
              <LayoutWrapper children={children} />
            </MantineProvider>
          </SessionProvider>
          <Analytics />
        </body>
      </html>
    </HighRiskProvider>
  );
}
