import { useState } from "react";
import {
  useQuery,
  useMutation,
  keepPreviousData, // 👈 Import the helper function here
  useQueryClient,
} from "@tanstack/react-query";
import { fetchWaitlistKpiUsers } from "@omenai/shared-services/admin/fetch_waitlist_kpi_users";
import { sendWaitlistInvites } from "@omenai/shared-services/admin/send_waitlist_invites";
import { IWaitlistLead } from "@omenai/shared-types";
import { useAuth } from "./useAuth";
import { toast_notif } from "@omenai/shared-utils/src/toast_notification";
// 1. Define the Shape of your API Response
interface UserSearchResponse {
  success: boolean;
  users: (IWaitlistLead & { _id: string })[];
  pagination: {
    total: number;
    pages: number;
    current: number;
  };
  segments: {
    total?: number;
    whales?: number;
    linkedin_leads?: number;
    self_taught?: number;
  };
  message: string;
  isOk: boolean;
  facets: {
    sources: FilterOption[];
    countries: FilterOption[];
    primary_kpi: FilterOption[];
    secondary_kpi: FilterOption[];
  };
}

interface UserFilter {
  buying_frequency?: string;
  formal_education?: string;
  source?: string;
  country?: string;
}

interface FilterOption {
  label: string;
  value: string;
  count: number;
}

export const useUserOperations = (activeTab: "artist" | "collector") => {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<UserFilter>({});
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const { csrf } = useAuth({ requiredRole: "admin" });
  const queryClient = useQueryClient();
  // 2. Fetch Users based on filters
  const { data, isLoading, refetch } = useQuery<UserSearchResponse>({
    queryKey: ["admin-users", activeTab, page, filters],
    queryFn: async () => {
      const result = await fetchWaitlistKpiUsers(
        {
          entity: activeTab,
          page,
          filters,
        },
        csrf || "",
      );
      return result as UserSearchResponse;
    },
    placeholderData: keepPreviousData,
  });

  // 3. Handle Selection (Checkbox Logic)
  const toggleSelection = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const toggleAll = (ids: string[]) => {
    // If all IDs on the current page are selected, deselect them.
    // Otherwise, select all of them.
    const allSelected = ids.every((id) => selectedIds.includes(id));

    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !ids.includes(id)));
    } else {
      // Add missing IDs to selection
      setSelectedIds((prev) => [...new Set([...prev, ...ids])]);
    }
  };

  // 4. Invite Mutation
  const inviteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const selectedUsers = data?.users
        .filter((user) => ids.includes(user._id))
        .map((user) => ({
          name: user.name,
          email: user.email,
          entity: user.entity,
        }))!;
      return await sendWaitlistInvites(selectedUsers, csrf ?? "");
    },
    onSuccess: (res) => {
      if (res.isOk) {
        toast_notif(res.message, "success");
        queryClient.invalidateQueries({
          queryKey: ["admin-users", activeTab, page, filters],
        });
      } else {
        toast_notif(res.message, "error");
      }
      setSelectedIds([]);
    },
  });

  return {
    users: data?.users || [],
    pagination: data?.pagination,
    segments: data?.segments,
    facets: data?.facets,
    isLoading,
    page,
    setPage,
    filters,
    setFilters,
    selectedIds,
    toggleSelection,
    toggleAll,
    inviteUsers: () => inviteMutation.mutate(selectedIds),
    isInviting: inviteMutation.isPending, // 👇 FIX: renamed from isLoading to isPending in v5
  };
};
