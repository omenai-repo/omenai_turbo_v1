import { getSession } from "@omenai/shared-auth/lib/auth/session";
import { SessionProvider } from "@omenai/package-provider/SessionProvider";
import React from "react";
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  return (
    <html lang="en">
      <SessionProvider session={session}>{children}</SessionProvider>
    </html>
  );
}