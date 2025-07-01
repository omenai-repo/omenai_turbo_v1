import { Inter } from "next/font/google";
import LayoutWrapper from "./LayoutWrapper";
import { Analytics } from "@vercel/analytics/react";
import { SessionProvider } from "@omenai/package-provider";
import { getServerSession } from "@omenai/shared-lib/session/getServerSession";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const initialSessionData = await getServerSession();

  return (
    <div className={`flex flex-col justify-center`}>
      <SessionProvider initialSessionData={initialSessionData}>
        <LayoutWrapper children={children} />
      </SessionProvider>
      <Analytics />
    </div>
  );
}
