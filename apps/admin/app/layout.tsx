import "./globals.css";
import { Inter } from "next/font/google";
import LayoutWrapper from "./LayoutWrapper";
import { Analytics } from "@vercel/analytics/react";

const nunito_sans = Inter({
  subsets: ["latin"],
  variable: "--font-nunito_sans",
  weight: ["300", "400", "500", "600", "700", "800"],
});
export default async function AdminDashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${nunito_sans.className} flex flex-col justify-center`}>
        <LayoutWrapper children={children} />
        <Analytics />
      </body>
    </html>
  );
}
