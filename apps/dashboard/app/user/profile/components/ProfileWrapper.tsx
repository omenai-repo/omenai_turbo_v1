"use client";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { fetchUserData } from "@omenai/shared-services/requests/fetchUserData";
import { AccountManagementSkeleton } from "@omenai/shared-ui-components/components/skeletons/AccountManagementSkeleton";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import UserProfile from "./ProfilePage";

export default function ProfileWrapper() {
  const { user } = useAuth({ requiredRole: "user" });

  const { data, error, isLoading } = useQuery({
    queryKey: ["fetch_user_info", user.user_id],
    queryFn: async () => {
      try {
        const [profile] = await Promise.all([fetchUserData(user.user_id)]);

        return {
          profile: profile.data,
        };
      } catch (err) {
        console.error("Failed to fetch user info:", err);
        throw err; // rethrow so React Query marks query as error
      }
    },
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
    enabled: !!user.user_id,
  });

  if (isLoading) return <AccountManagementSkeleton />;

  return <UserProfile user={data?.profile} />;
}
