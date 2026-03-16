"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast_notif } from "@omenai/shared-utils/src/toast_notification";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";

// Components
import EmptyState from "./components/EmptyState";
import ReviewCard from "./components/ReviewCard";
import PaginationControls from "./components/PaginationControls";
import { Loader2 } from "lucide-react";
import { fetchPriceReviewRequests } from "@omenai/shared-services/artworks/fetchPriceReviewRequests";
import { updatePriceReviewRequest } from "@omenai/shared-services/artworks/updatePriceReviewRequest";

const fetchReviews = async ({ queryKey }: any) => {
  const [_key, artistId, tab, page] = queryKey;

  const statusMap = {
    ACTIVE: "PENDING_ADMIN_REVIEW,PENDING_ARTIST_ACTION",
    RESOLVED:
      "APPROVED_ARTIST_PRICE,APPROVED_COUNTER_PRICE,AUTO_APPROVED,DECLINED_BY_ADMIN,DECLINED_BY_ARTIST",
  };

  const res = await fetchPriceReviewRequests(
    artistId,
    page.toString(),
    "10",
    statusMap[tab as keyof typeof statusMap],
  );
  if (!res.isOk) {
    toast_notif(res.message, "error");
    return { data: [], meta: [] };
  }
  return { data: res.data, meta: res.meta };
};

export default function ArtistPricingHub() {
  const queryClient = useQueryClient();
  const { user, csrf } = useAuth({ requiredRole: "artist" });

  const [activeTab, setActiveTab] = useState<"ACTIVE" | "RESOLVED">("ACTIVE");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["artist_price_reviews", user?.id, activeTab, currentPage],
    queryFn: fetchReviews,
    enabled: !!user.artist_id,
    refetchOnWindowFocus: false,
  });

  const resolveOfferMutation = useMutation({
    mutationFn: async ({
      review_id,
      action,
    }: {
      review_id: string;
      action: "ACCEPT" | "DECLINE";
    }) => {
      const res = await updatePriceReviewRequest(
        user.artist_id,
        review_id,
        action,
        csrf || "",
      );

      if (!res.isOk) throw new Error(res.message);
      return res;
    },
    onSuccess: (result) => {
      toast_notif(result.message, "success");
      queryClient.invalidateQueries({ queryKey: ["artist_price_reviews"] });
    },
    onError: (error: any) => {
      toast_notif(error.message, "error");
    },
  });

  if (isLoading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center text-neutral-500 gap-3">
        <Loader2 size={24} className="animate-spin text-dark" />
        <p className="text-sm font-medium">Loading your pricing hub...</p>
      </div>
    );
  }

  const displayReviews = data?.data || [];
  const meta = data?.meta || { totalPages: 1 };

  return (
    // The massive but capped container width
    <div className="w-full max-w-[100rem] mx-auto flex flex-col gap-6 relative">
      {isFetching && !isLoading && (
        <div className="absolute top-2 right-10 flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-sm border border-neutral-100 z-10">
          <Loader2 size={14} className="animate-spin text-dark" />
          <span className="text-xs font-medium text-neutral-500">Updating</span>
        </div>
      )}

      {/* Page Header & Tabs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-semibold text-dark">Pricing Proposals</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Track and manage your requested pricing overrides.
          </p>
        </div>

        <div className="flex p-1 bg-neutral-100 rounded-lg border border-neutral-200 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab("ACTIVE")}
            className={`flex-1 sm:px-6 py-2 text-sm font-medium rounded-md transition-all ${
              activeTab === "ACTIVE"
                ? "bg-white text-dark shadow-sm"
                : "text-neutral-500 hover:text-dark"
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setActiveTab("RESOLVED")}
            className={`flex-1 sm:px-6 py-2 text-sm font-medium rounded-md transition-all ${
              activeTab === "RESOLVED"
                ? "bg-white text-dark shadow-sm"
                : "text-neutral-500 hover:text-dark"
            }`}
          >
            History
          </button>
        </div>
      </div>

      {/* Content Area */}
      {displayReviews.length === 0 ? (
        <EmptyState activeTab={activeTab} />
      ) : (
        <div className="flex flex-col gap-4">
          <div
            className={`flex flex-col gap-3 transition-opacity duration-200 ${
              isFetching ? "opacity-50" : "opacity-100"
            }`}
          >
            {/* The Invisible Grid Headers (Matches the ReviewCard col-spans exactly) */}
            <div className="hidden lg:grid grid-cols-12 gap-6 px-5 py-2">
              <span className="col-span-5 text-xs font-bold text-neutral-400 uppercase tracking-wider pl-16">
                Artwork
              </span>
              <span className="col-span-4 text-xs font-bold text-neutral-400 uppercase tracking-wider">
                Pricing Proposal
              </span>
              <span className="col-span-3 text-xs font-bold text-neutral-400 uppercase tracking-wider">
                Status
              </span>
            </div>

            {/* The List of Cards */}
            {displayReviews.map((review: any) => (
              <ReviewCard
                key={review._id}
                review={review}
                onResolve={(action) =>
                  resolveOfferMutation.mutate({ review_id: review._id, action })
                }
                isMutating={
                  resolveOfferMutation.isPending &&
                  resolveOfferMutation.variables?.review_id === review._id
                }
              />
            ))}
          </div>

          <PaginationControls
            currentPage={currentPage}
            totalPages={meta.totalPages}
            onPageChange={setCurrentPage}
            isFetching={isFetching}
          />
        </div>
      )}
    </div>
  );
}
