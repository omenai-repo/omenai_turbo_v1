"use client";
import { fetchSearchKeyWordResults } from "@omenai/shared-services/search/fetchSearchKeywordResults";
import { useSearchParams } from "next/navigation";
import NotFoundSearchResult from "./NotFoundSearchResult";
import SearchResultDetails from "./SearchResultDetails";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { ArtworksListingSkeletonLoader } from "@omenai/shared-ui-components/components/loader/ArtworksListingSkeletonLoader";
import { useQuery } from "@tanstack/react-query";
import DesktopNavbar from "@omenai/shared-ui-components/components/navbar/desktop/DesktopNavbar";
import Footer from "@omenai/shared-ui-components/components/footer/Footer";

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

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between">
      <DesktopNavbar />

      <main className="container mx-auto px-4 pb-20 flex-grow">
        {isLoading ? (
          <ArtworksListingSkeletonLoader />
        ) : !artworks || artworks.length === 0 ? (
          <NotFoundSearchResult />
        ) : (
          <SearchResultDetails
            data={artworks}
            searchTerm={searchTerm as string}
            sessionId={user && user.role === "user" ? user.id : undefined}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}
