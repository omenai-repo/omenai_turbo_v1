import "./globals.css";
import { DM_Sans, Poppins } from "next/font/google";
import { getSession } from "@omenai/shared-auth/lib/auth/session";
import LayoutWrapper from "./LayoutWrapper";
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
  const session = await getSession();
  return (
    <html lang="en">
      <body className={`${poppins.className} flex flex-col justify-center`}>
        <LayoutWrapper session={session} children={children} />
      </body>
    </html>
  );
}
