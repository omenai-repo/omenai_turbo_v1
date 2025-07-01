import NextTopLoader from "nextjs-toploader";
import "./globals.css";
import { Inter } from "next/font/google";
import { QueryProvider } from "@omenai/package-provider";
import { Toaster } from "sonner";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import {
  ColorSchemeScript,
  MantineProvider,
  mantineHtmlProps,
} from "@mantine/core";
const nunito_sans = Inter({
  subsets: ["latin"],
  variable: "--font-nunito_sans",
  weight: ["300", "400", "500", "600", "700", "800"],
});
export default function AdminDashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript />
      </head>
      <body className={`${nunito_sans.className} flex flex-col justify-center`}>
        <Toaster
          position="top-right"
          expand
          visibleToasts={3}
          closeButton
          duration={7000}
        />
        <NextTopLoader color="#6246EA" height={6} />

        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
