import "./globals.css";
import { Work_Sans } from "next/font/google";
import LayoutWrapper from "./LayoutWrapper";
import { Analytics } from "@vercel/analytics/react";
import { Metadata, Viewport } from "next";
import { LowRiskProvider } from "@omenai/package-provider/ConfigCatProvider";
import { clientConfig } from "@omenai/rollbar-config";
import { Provider as RollbarProvider } from "@rollbar/react";
import { ColorSchemeScript } from "@mantine/core";
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
  title: "Omenai Authentication",
  description: "Omenai – Create an Account or Sign In",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export default async function AuthDashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const nonce = headersList.get("x-nonce") || "";

  return (
    <RollbarProvider config={clientConfig}>
      <LowRiskProvider>
        <html lang="en">
          <head>
            <meta name="color-scheme" content="light" />
            <ColorSchemeScript defaultColorScheme="light" nonce={nonce} />

            <link rel="icon" href="/favicon.ico" />
            <link rel="shortcut icon" href="/favicon.ico" />
            <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
          </head>
          <body
            className={`${work_sans.variable} font-sans flex flex-col justify-center`}
          >
            <LayoutWrapper>{children}</LayoutWrapper>
            <Analytics />
          </body>
        </html>
      </LowRiskProvider>
    </RollbarProvider>
  );
}
