// apps/web/app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { PT_Serif, Work_Sans, DM_Sans } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import { Toaster } from "sonner";
import { Provider as RollbarProvider } from "@rollbar/react";
import { clientConfig } from "@omenai/rollbar-config";
import { getServerSession } from "@omenai/shared-lib/session/getServerSession";
import { HighRiskProvider } from "@omenai/package-provider/ConfigCatProvider";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import { LayoutWrapper } from "./LayoutWrapper";
import { ColorSchemeScript, mantineHtmlProps } from "@mantine/core";
import { headers } from "next/headers";

export const metadata: Metadata = {
  title: "Omenai - Discover and collect contemporary African Art",
  description:
    "Discover and collect contemporary African Art from leading and emerging artists from across Africa and it's disapora through the Omenai Platform",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "Omenai - Discover and collect contemporary African Art",
    description:
      "Discover and collect contemporary African Art from leading and emerging artists from across Africa and it's disapora through the Omenai Platform",
    url: "https://omenai.app",
  },
  manifest: "/site.webmanifest",
};

const work_sans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-work_sans",
  weight: ["300", "400", "500", "600"],
  display: "swap",
});
const pt_serif = PT_Serif({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-pt_serif",
  display: "swap",
});

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const initialSessionData = await getServerSession();

  // 1. Get the Nonce
  const headersList = await headers();
  const nonce = headersList.get("x-nonce") || "";

  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <meta name="color-scheme" content="light" nonce={nonce} />

        <link rel="icon" href="/favicon.ico" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <title>Omenai - Discover and collect contemporary African Art</title>
      </head>
      <body
        className={`${work_sans.variable} bg-white ${pt_serif.variable} font-sans flex flex-col justify-center`}
      >
        {/* 3. Providers must be INSIDE body */}
        <RollbarProvider config={clientConfig}>
          <HighRiskProvider>
            {/* 4. Pass nonce to TopLoader (Critical for CSP) */}
            <NextTopLoader color="#0f172a" height={6} nonce={nonce} />

            <Toaster
              position="top-right"
              expand
              visibleToasts={3}
              closeButton
              duration={7000}
            />
            <LayoutWrapper sessionData={initialSessionData}>
              {children}
            </LayoutWrapper>
          </HighRiskProvider>
        </RollbarProvider>
      </body>
    </html>
  );
}
