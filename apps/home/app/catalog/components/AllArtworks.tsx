"use client";

import { fetchPaginatedArtworks } from "@omenai/shared-services/artworks/fetchPaginatedArtworks";
import { ArtworksListingSkeletonLoader } from "@omenai/shared-ui-components/components/loader/ArtworksListingSkeletonLoader";
import NotFoundData from "@omenai/shared-ui-components/components/notFound/NotFoundData";
import Pagination from "@omenai/shared-ui-components/components/pagination/Pagination";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { ArtworkGrid } from "@omenai/shared-ui-components/components/artworks/ArtworkGrid";
import { useArtworksPagination } from "@omenai/shared-hooks/hooks/useArtworksPagination";
export default function AllArtworks() {
  const { user } = useAuth({ requiredRole: "user" });

  const {
    artworksArray,
    loading,
    isLoading,
    artworks,
    pageCount,
    currentPage,
    setCurrentPage,
    setArtworks,
    setIsLoading,
    filterOptions,
  } = useArtworksPagination();

  if (loading || isLoading) {
    return <ArtworksListingSkeletonLoader />;
  }

  if (
    !artworksArray ||
    artworksArray.data.length === 0 ||
    artworks.length === 0
  ) {
    return (
      <div className="w-full h-full grid place-items-center my-12">
        <NotFoundData className="h-[40vh]" title="No artworks found" />
      </div>
    );
  }

  return (
    <>
      <ArtworkGrid artworks={artworks} sessionId={user ? user.id : undefined} />

      <Pagination
        total={pageCount}
        fn={fetchPaginatedArtworks}
        fnArgs={[filterOptions]}
        setArtworks={setArtworks}
        setCurrentPage={setCurrentPage}
        setIsLoading={setIsLoading}
        currentPage={currentPage}
      />
    </>
  );
}
