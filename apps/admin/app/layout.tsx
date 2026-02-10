import NextTopLoader from "nextjs-toploader";
import "./globals.css";
import { Cormorant_Garamond, Work_Sans } from "next/font/google";
import { QueryProvider } from "@omenai/package-provider";
import { Toaster } from "sonner";
import {
  ColorSchemeScript,
  MantineProvider,
  mantineHtmlProps,
} from "@mantine/core";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";

import "@mantine/core/styles.css";
import "@mantine/dropzone/styles.css";
import "@mantine/tiptap/styles.css";
import { Metadata, Viewport } from "next";
import { clientConfig } from "@omenai/rollbar-config";
import { Provider as RollbarProvider } from "@rollbar/react";
import { headers } from "next/headers";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

const work_sans = Work_Sans({
  subsets: ["latin"],
  variable: "--font-work_sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Omenai Admin",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export default async function AdminDashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const nonce = (await headers()).get("x-nonce") || "";

  return (
    <RollbarProvider config={clientConfig}>
      <html lang="en" {...mantineHtmlProps}>
        <head>
          <meta name="color-scheme" content="light" />
          <ColorSchemeScript defaultColorScheme="light" />
        </head>
        <body className={`${work_sans.variable} flex flex-col justify-center`}>
          <Toaster
            position="top-right"
            expand
            visibleToasts={3}
            closeButton
            duration={7000}
          />
          <NextTopLoader color="#030303" height={6} />

          <MantineProvider defaultColorScheme="light" forceColorScheme="light">
            <QueryProvider>{children}</QueryProvider>
          </MantineProvider>
        </body>
      </html>
    </RollbarProvider>
  );
}
