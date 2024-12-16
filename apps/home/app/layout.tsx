import type { Metadata } from "next";
import { getServerSession } from "@omenai/shared-utils/src/checkSessionValidity";
import { Inter } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import { SessionProvider } from "@omenai/package-provider/SessionProvider";
import QueryProvider from "@omenai/package-provider/QueryProvider";
import LoginModal from "@omenai/shared-ui-components/components/modal/LoginModal";
import RecoveryModal from "@omenai/shared-ui-components/components/modal/RecoveryModal";
import { OrderReceivedModal } from "@omenai/shared-ui-components/components/modal/OrderConfirmedModal";
import { Toaster } from "sonner";
import type { Viewport } from "next";
import "./globals.css";
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};
const nunito_sans = Inter({
  subsets: ["latin"],
  variable: "--font-nunito_sans",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Omenai",
  description: "Omenai Home",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();
  return (
    <html lang="en">
      <body className={`${nunito_sans.className} flex flex-col justify-center`}>
        <NextTopLoader color="#1A1A1A" height={6} />
        <Toaster
          position="top-right"
          expand
          visibleToasts={3}
          closeButton
          duration={7000}
        />
        <SessionProvider session={session}>
          <QueryProvider>
            <LoginModal />
            <RecoveryModal />
            <OrderReceivedModal />
            {children}
          </QueryProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
