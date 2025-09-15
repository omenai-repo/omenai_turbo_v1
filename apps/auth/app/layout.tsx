import "./globals.css";
import { Cormorant_Garamond, Work_Sans } from "next/font/google";
import LayoutWrapper from "./LayoutWrapper";
import { Analytics } from "@vercel/analytics/react";

const work_sans = Work_Sans({
  subsets: ["latin"],
  variable: "--font-work_sans",
  display: "swap",
});

// Heading font → Cormorant Garamond
const cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});
export default async function AuthDashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${work_sans.variable} ${cormorantGaramond.variable} flex flex-col justify-center`}
      >
        <LayoutWrapper children={children} />
        <Analytics />
      </body>
    </html>
  );
}
