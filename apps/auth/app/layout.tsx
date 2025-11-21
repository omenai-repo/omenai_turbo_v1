import "./globals.css";
import { Work_Sans } from "next/font/google";
import LayoutWrapper from "./LayoutWrapper";
import { Analytics } from "@vercel/analytics/react";
import { Viewport } from "next";
import {
  HighRiskProvider,
  LowRiskProvider,
} from "@omenai/package-provider/ConfigCatProvider";
import { clientConfig } from "@omenai/rollbar-config";
import { Provider as RollbarProvider } from "@rollbar/react";

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

export default async function AuthDashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RollbarProvider config={clientConfig}>
      <LowRiskProvider>
        <html lang="en">
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
