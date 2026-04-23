import { useQuery } from "@tanstack/react-query";
import { fetchFollows } from "@omenai/shared-services/engagements/getFollowerIds";
export function useUserFollowedIds(sessionId: string | undefined) {
  return useQuery({
    queryKey: ["user-followed-ids", sessionId],
    queryFn: async () => {
      if (!sessionId) return [];
      const response = await fetchFollows(sessionId);
      if (!response.isOk) return [];
      return response.followedIds;
    },
    enabled: !!sessionId, // Only runs if they are logged in
    staleTime: Infinity, // Keeps the cache alive so it doesn't refetch randomly
  });
}
