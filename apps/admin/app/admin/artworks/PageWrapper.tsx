"use client";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import React, { useState } from "react";
import { fetchPaginatedArtworks } from "@omenai/shared-services/artworks/fetchPaginatedArtworks";
import NotFoundData from "@omenai/shared-ui-components/components/notFound/NotFoundData";
import { AdminArtworkSkeleton } from "@omenai/shared-ui-components/components/skeletons/AdminArtworkSkeleton";
import { ArtworkGrid } from "@omenai/shared-ui-components/components/artworks/ArtworkGrid";
import Pagination from "@omenai/shared-ui-components/components/pagination/Pagination";
import { Download } from "lucide-react";
import { getOptimizedImage } from "@omenai/shared-lib/storage/getImageFileView";
import { toast_notif } from "@omenai/shared-utils/src/toast_notification";
import { ArtworkSchemaTypes } from "@omenai/shared-types";
import { useArtworksPagination } from "@omenai/shared-hooks/hooks/useArtworksPagination";

export default function ArtworkListing() {
  const [viewMode, setViewMode] = useState<"gallery" | "artist">("gallery");
  const { user } = useAuth({ requiredRole: "admin" });
  const [isDownloading, setIsDownloading] = useState(false);

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

  async function downloadArtwork(artwork: ArtworkSchemaTypes) {
    setIsDownloading(true);
    toast_notif(`Downloading ${artwork.title}`, "info");
    try {
      const image_href = getOptimizedImage(artwork.url, "xlarge");
      const response = await fetch(image_href);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = artwork.title;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      toast_notif(`Downloaded ${artwork.title}`, "success");
    } catch (error) {
      toast_notif("Failed to download artwork", "error");
    }
    setIsDownloading(false);
  }

  if (loading || isLoading) {
    return <AdminArtworkSkeleton />;
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
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-20 shadow-sm">
        {/* View Toggle Switch */}
        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
          <button
            onClick={() => setViewMode("gallery")}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
              viewMode === "gallery"
                ? "bg-white shadow-sm text-slate-900"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Gallery
          </button>
          <button
            onClick={() => setViewMode("artist")}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
              viewMode === "artist"
                ? "bg-white shadow-sm text-slate-900"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Artist
          </button>
        </div>
      </div>

      <div className="p-6 md:p-8 animate-in fade-in duration-300">
        <ArtworkGrid
          artworks={artworks}
          sessionId={user ? user.id : undefined}
          filterByRole={viewMode}
          renderArtworkWrapper={(art, artworkCard) => (
            <div className="relative">
              <button
                disabled={isDownloading}
                onClick={() => downloadArtwork(art)}
                className="absolute bg-white disabled:bg-white/50 top-4 right-2 p-2 rounded-full z-10 cursor-pointer"
              >
                <Download size={18} />
              </button>
              {artworkCard}
            </div>
          )}
        />
      </div>

      <Pagination
        total={pageCount}
        fn={fetchPaginatedArtworks}
        fnArgs={[filterOptions]}
        setArtworks={setArtworks}
        setCurrentPage={setCurrentPage}
        setIsLoading={setIsLoading}
        currentPage={currentPage}
      />
    </div>
  );
}
