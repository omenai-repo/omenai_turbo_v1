import "./globals.css";
import { Poppins } from "next/font/google";
import LayoutWrapper from "./LayoutWrapper";
import { Analytics } from "@vercel/analytics/react";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import {
  ColorSchemeScript,
  MantineProvider,
  mantineHtmlProps,
} from "@mantine/core";

const dm_sans = Poppins({
  subsets: ["latin"],
  variable: "--font-sans_serif",
  weight: ["300", "400", "500", "600", "700", "800"],
});
export default async function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript />
      </head>
      <body
        className={`${dm_sans.className} flex flex-col px-4 justify-center`}
      >
        <MantineProvider>
          <LayoutWrapper children={children} />
        </MantineProvider>
        <Analytics />
      </body>
    </html>
  );
}
