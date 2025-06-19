import "./globals.css";
import { DM_Sans, Poppins } from "next/font/google";
import LayoutWrapper from "./LayoutWrapper";
import { Analytics } from "@vercel/analytics/react";

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-sans_serif",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});
export default async function AuthDashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${poppins.className} flex flex-col justify-center`}>
        <LayoutWrapper children={children} />
        <Analytics />
      </body>
    </html>
  );
}
