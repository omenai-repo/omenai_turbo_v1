"use client";
import { fetchSearchKeyWordResults } from "@omenai/shared-services/search/fetchSearchKeywordResults";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import NotFoundSearchResult from "./NotFoundSearchResult";
import SearchResultDetails from "./SearchResultDetails";
import { ArtworkSchemaTypes } from "@omenai/shared-types";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { ArtworksListingSkeletonLoader } from "@omenai/shared-ui-components/components/loader/ArtworksListingSkeletonLoader";
import { useQuery } from "@tanstack/react-query";
export default function SearchResultWrapper() {
  const searchParams = useSearchParams();
  const searchTerm = searchParams.get("searchTerm");

  const { user } = useAuth({ requiredRole: "user" });

  const { data: artworks, isLoading } = useQuery({
    queryKey: ["search_results", searchTerm],
    queryFn: async () => {
      if (!searchTerm) {
        return [];
      }
      const data = await fetchSearchKeyWordResults(searchTerm);
      return data?.data || [];
    },
    enabled: !!searchTerm,
  });

  if (isLoading) return <ArtworksListingSkeletonLoader />;

  return (
    <>
      <div className="w-full">
        {artworks.length === 0 ? (
          <NotFoundSearchResult />
        ) : (
          <SearchResultDetails
            data={artworks}
            searchTerm={searchTerm as string}
            sessionId={user && user.role === "user" ? user.id : undefined}
          />
        )}
      </div>
    </>
  );
}
