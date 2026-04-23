"use client";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import useFollowState from "@omenai/shared-hooks/hooks/useFollowState"; // Adjust path as needed
import { useUserFollowedIds } from "@omenai/shared-hooks/hooks/useUserFollowerIds";
export default function FollowComponent({
  followerCount,
  entityId,
  entityType,
}: {
  followerCount: number;
  entityId: string;
  entityType: "artist" | "gallery";
}) {
  const { user } = useAuth({ requiredRole: "user" });
  const { data: userFollowingIds = [] } = useUserFollowedIds(
    user?.user_id ?? "",
  );

  const { followState, handleFollow } = useFollowState(
    followerCount,
    userFollowingIds,
    user?.user_id ?? "",
    entityId,
    entityType,
  );

  return (
    <div className="flex items-center gap-3">
      {/* Optional: Render the follower count if you want it next to the button */}
      {/* <span className="text-xs text-gray-600">
        {followState.count} Followers
      </span> */}

      <button
        onClick={() => handleFollow(!followState.isFollowing)}
        className={`px-4 py-2 text-xs font-semibold rounded-full transition-all duration-200 border ${
          followState.isFollowing
            ? "bg-black text-white border-neutral-200 hover:border-neutral-400" // Active "Following" state
            : "bg-white text-black border-neutral-200 hover:border-neutral-400" // Inactive "Follow" state
        }`}
      >
        {followState.isFollowing ? "Following" : "Follow"}
      </button>
    </div>
  );
}
