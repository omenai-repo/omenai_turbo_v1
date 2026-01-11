"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@omenai/shared-hooks/hooks/useSession";
import { ClientSessionData } from "@omenai/shared-types";
import { auth_uri } from "@omenai/url-config/src/config";

type Props = {
  initialData: ClientSessionData | null;
  children: React.ReactNode;
};

export function AuthGuard({ children, initialData }: Props) {
  const router = useRouter();
  const { sessionData, isLoadingQuery } = useSession({ initialData });

  useEffect(() => {
    if (!isLoadingQuery && sessionData && !sessionData.isLoggedIn) {
      router.replace(`${auth_uri()}/login`);
    }
  }, [isLoadingQuery, sessionData, router]);

  if (isLoadingQuery) return null;
  if (!sessionData?.isLoggedIn) return null;

  return <>{children}</>;
}
