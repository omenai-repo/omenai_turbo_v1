import NextTopLoader from "nextjs-toploader";
import "./globals.css";
import { Cormorant_Garamond, Work_Sans } from "next/font/google";
import { QueryProvider } from "@omenai/package-provider";
import { Toaster } from "sonner";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import {
  ColorSchemeScript,
  MantineProvider,
  mantineHtmlProps,
} from "@mantine/core";

import "@mantine/core/styles.css";
import "@mantine/dropzone/styles.css";
import "@mantine/tiptap/styles.css";
import { Viewport } from "next";

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

export default function AdminDashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
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
  );
}
