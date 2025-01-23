import "./globals.css";
import { Poppins } from "next/font/google";
import { getServerSession } from "@omenai/shared-utils/src/checkSessionValidity";
import LayoutWrapper from "./LayoutWrapper";
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
  const session = await getServerSession();
  return (
    <html lang="en">
      <body
        className={`${dm_sans.className} flex flex-col px-4 justify-center`}
      >
        <LayoutWrapper session={session} children={children} />
      </body>
    </html>
  );
}
