import { UserType } from "@omenai/shared-types";

import "./globals.css";
import { Inter } from "next/font/google";
import LayoutWrapper from "./LayoutWrapper";
import { getSession } from "@omenai/shared-auth/lib/auth/session";
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
  const session = await getSession();
  return (
    <html lang="en">
      <body className={`${nunito_sans.className} flex flex-col justify-center`}>
        <LayoutWrapper session={session} children={children} />
      </body>
    </html>
  );
}
