import { AuthGuard } from "@omenai/package-provider/AuthGuard";
import { getServerSession } from "@omenai/shared-lib/session/getServerSession";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const initialSessionData = await getServerSession();

  return <AuthGuard initialData={initialSessionData}>{children}</AuthGuard>;
}
