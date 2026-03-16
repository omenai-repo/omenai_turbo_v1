"use client";

import { useState, useEffect } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { toast_notif } from "@omenai/shared-utils/src/toast_notification";
import ReviewWorkspace from "./ReviewWorkspace";
import ReviewSidebar from "./ReviewSidebar";
import { fetchPriceReviewRequests } from "@omenai/shared-services/admin/fetchPriceReviewRequests";
import { updatePriceReviewRequest } from "@omenai/shared-services/admin/updatePriceReviewRequest";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
// Updated to build the exact URL parameters expected by the backend
const fetchAdminQueue = async ({ queryKey }: any) => {
  const [_key, page, artistId] = queryKey;

  const res = await fetchPriceReviewRequests(
    artistId,
    page.toString(),
    "20",
    "PENDING_ADMIN_REVIEW",
  );
  if (!res.isOk) {
    toast_notif(res.message, "error");
    return { data: [], meta: [] };
  }
  return { data: res.data, meta: res.meta };
};

export default function AdminPricingTriage() {
  const queryClient = useQueryClient();

  const { csrf } = useAuth({ requiredRole: "admin" });

  // App State
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchArtistId, setSearchArtistId] = useState("");

  // Auto-reset selection and pagination when search changes
  useEffect(() => {
    setCurrentPage(1);
    setSelectedReviewId(null);
  }, [searchArtistId]);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["admin_price_queue", currentPage, searchArtistId],
    queryFn: fetchAdminQueue,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData, // Prevents the sidebar from flashing empty while loading the next page
  });

  const adminActionMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await updatePriceReviewRequest(payload, csrf || "");

      if (!res.isOk)
        throw new Error(
          res.message ||
            "Failed to process request. Pleasre try again or contact support",
        );
      return res;
    },
    onSuccess: () => {
      toast_notif("Decision recorded successfully.", "success");
      queryClient.invalidateQueries({ queryKey: ["admin_price_queue"] });
      setSelectedReviewId(null);
    },
    onError: (error: any) => {
      toast_notif(error.message, "error");
    },
  });

  const reviews = data?.data || [];
  const meta = data?.meta || { totalPages: 1 };
  const selectedReview = reviews.find((r: any) => r._id === selectedReviewId);

  return (
    <div className="w-full h-[calc(100vh-80px)] max-h-[1000px] flex rounded -2xl border border-neutral-200 shadow-xl overflow-hidden bg-white mx-auto max-w-[95rem]">
      {/* Left Column: The Queue (35% width) */}
      <div className="w-full md:w-[35%] lg:w-[30%] h-full shrink-0">
        <ReviewSidebar
          reviews={reviews}
          selectedId={selectedReviewId}
          onSelect={setSelectedReviewId}
          isLoading={isLoading}
          isFetching={isFetching}
          currentPage={currentPage}
          totalPages={meta.totalPages}
          onPageChange={setCurrentPage}
          onSearch={setSearchArtistId}
        />
      </div>

      {/* Right Column: The Workspace (65% width) */}
      <div className="hidden md:block flex-1 h-full border-l border-neutral-200">
        <ReviewWorkspace
          review={selectedReview}
          onAction={adminActionMutation.mutate}
          isMutating={adminActionMutation.isPending}
        />
      </div>
    </div>
  );
}
