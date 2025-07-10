import LayoutWrapper from "./LayoutWrapper";
import { Analytics } from "@vercel/analytics/react";
import { SessionProvider } from "@omenai/package-provider";
import { getServerSession } from "@omenai/shared-lib/session/getServerSession";
import { ModalsProvider } from "@mantine/modals";
export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const initialSessionData = await getServerSession();

  return (
    <div className={`flex flex-col justify-center`}>
      <SessionProvider initialSessionData={initialSessionData}>
        <ModalsProvider>
          <LayoutWrapper children={children} />
        </ModalsProvider>
      </SessionProvider>
      <Analytics />
    </div>
  );
}
