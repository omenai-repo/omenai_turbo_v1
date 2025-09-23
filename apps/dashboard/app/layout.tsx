import "./globals.css";
import LayoutWrapper from "./LayoutWrapper";
import { Analytics } from "@vercel/analytics/react";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import {
  ColorSchemeScript,
  MantineProvider,
  mantineHtmlProps,
} from "@mantine/core";
import { Work_Sans } from "next/font/google";

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


import { getServerSession } from "@omenai/shared-lib/session/getServerSession";
import { SessionProvider } from "@omenai/package-provider";
import { Viewport } from "next";
export default async function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const initialSessionData = await getServerSession();
  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript />
      </head>
      <body
        className={`${work_sans.variable} flex flex-col px-4 justify-center`}
      >
        <SessionProvider initialSessionData={initialSessionData}>
          <MantineProvider>
            <LayoutWrapper children={children} />
          </MantineProvider>
        </SessionProvider>
        <Analytics />
      </body>
    </html>
  );
}
