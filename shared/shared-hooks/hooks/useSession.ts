// useSession.ts
import { ClientSessionData } from "@omenai/shared-types";
import { getApiUrl, base_url } from "@omenai/url-config/src/config";
import { useQuery } from "@tanstack/react-query";

export function useSession({
  initialData,
}: {
  initialData: ClientSessionData | null;
}) {
  const {
    data: sessionData,
    isLoading: isLoadingQuery,
    isPending,
  } = useQuery<ClientSessionData, Error>({
    queryKey: ["session"],
    queryFn: fetchSessionData,
    staleTime: 0,
    refetchOnWindowFocus: true,
    retry: false,
    // Use initialData to immediately provide session data if available from SSR
    initialData: initialData || undefined,
    // Only refetch if we don't have initial data or if it's stale
    refetchOnMount: !initialData,
  });

  return { sessionData, isLoadingQuery, isPending };
}

async function fetchSessionData(): Promise<ClientSessionData> {
  const res = await fetch(`${getApiUrl()}/api/auth/session/user`, {
    headers: {
      "Content-Type": "application/json",
      Origin: base_url(),
    },
    credentials: "include",
  });
  if (!res.ok) {
    console.error("Failed to fetch session data:", res.status, res.statusText);
    return { isLoggedIn: false, user: null, csrfToken: "" };
  }
  const { user, csrfToken } = await res.json();
  return { isLoggedIn: true, user: user.userData, csrfToken };
}
