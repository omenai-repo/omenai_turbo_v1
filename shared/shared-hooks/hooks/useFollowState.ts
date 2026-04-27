"use client";
import { actionStore } from "@omenai/shared-state-store/src/actions/ActionStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useAuth } from "./useAuth";

import { addFollow } from "@omenai/shared-services/engagements/addFollow";
import { deleteFollow } from "@omenai/shared-services/engagements/deleteFollow";
import { toast_notif } from "@omenai/shared-utils/src/toast_notification";

interface FollowOptions {
  followerId: string;
  followingId: string;
  followingType: "artist" | "gallery";
  state: boolean;
}

export const updateFollowStatus = async (
  options: FollowOptions,
  csrf: string,
) => {
  try {
    const fn = options.state
      ? addFollow({ ...options }, csrf || "")
      : deleteFollow({ ...options }, csrf || "");

    const response = await fn;

    if (!response.isOk) {
      toast_notif(
        response.message ||
          "Something went wrong with this action, try again or contact support",
        "info",
      );
      // CORRECTION: Exit early so the hook knows to roll back the UI
      return { isOk: false };
    }

    return { isOk: true };
  } catch (error) {
    console.error("Error updating follow status:", error);
    return { isOk: false, error };
  }
};

function useFollowState(
  initialFollowerCount: number,
  userFollowingIds: string[],
  sessionId: string | undefined,
  entityId: string,
  entityType: "artist" | "gallery",
) {
  const queryClient = useQueryClient();
  const { toggleLoginModal } = actionStore();
  const { csrf } = useAuth({ requiredRole: "user" });

  // CORRECTION: Extract the boolean evaluation so we don't pass an array dependency
  const isCurrentlyFollowing = userFollowingIds.includes(entityId);

  const [followState, setFollowState] = useState({
    count: initialFollowerCount,
    isFollowing: isCurrentlyFollowing,
  });

  // 1. Only sync the count if the actual server prop changes
  useEffect(() => {
    setFollowState((prev) => {
      if (prev.count === initialFollowerCount) return prev;
      return { ...prev, count: initialFollowerCount };
    });
  }, [initialFollowerCount]);

  // 2. Only sync the boolean if the React Query array changes
  useEffect(() => {
    setFollowState((prev) => {
      if (prev.isFollowing === isCurrentlyFollowing) return prev;
      return { ...prev, isFollowing: isCurrentlyFollowing };
    });
  }, [isCurrentlyFollowing]);

  const { mutateAsync: updateFollowMutation } = useMutation({
    mutationFn: (options: { state: boolean }) =>
      updateFollowStatus(
        {
          followerId: sessionId!,
          followingId: entityId,
          followingType: entityType,
          state: options.state,
        },
        csrf || "",
      ),
    onSuccess: async (data) => {
      if (data?.isOk) {
        queryClient.invalidateQueries({
          queryKey: [entityType.toLowerCase(), entityId],
        });
        queryClient.invalidateQueries({
          queryKey: ["user-followed-ids", sessionId],
        });
      } else {
        setFollowState({
          count: initialFollowerCount,
          isFollowing: isCurrentlyFollowing,
        });
      }
    },
    onError: () => {
      setFollowState({
        count: initialFollowerCount,
        isFollowing: isCurrentlyFollowing,
      });
    },
  });

  const handleFollow = async (state: boolean) => {
    // UPDATED: Checks for undefined, null, or empty string ("")
    if (!sessionId) {
      toggleLoginModal(true);
      return;
    }

    if (state) {
      setFollowState((prev) => ({
        count: prev.isFollowing ? prev.count : prev.count + 1,
        isFollowing: true,
      }));
    } else {
      setFollowState((prev) => ({
        count: !prev.isFollowing ? prev.count : prev.count - 1,
        isFollowing: false,
      }));
    }

    await updateFollowMutation({ state });
  };
  return { followState, handleFollow };
}

export default useFollowState;
