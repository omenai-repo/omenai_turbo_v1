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

  async function downloadArtwork(url: string, title: string) {
    setIsDownloading(true);
    toast_notif(`Downloading ${title}`, "info");
    try {
      const image_href = getOptimizedImage(url, "xlarge");
      const response = await fetch(image_href);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = title;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      toast_notif(`Downloaded ${title}`, "success");
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
  const filteredArtworks = artworksArray.data.filter(
    (artwork: ArtworkSchemaTypes) => artwork.role_access.role === viewMode,
  );

  return (
    <div className="min-h-screen bg-neutral-50 font-sans text-slate-800">
      <div className="bg-neutral-50  py-6 flex justify-between items-center sticky -top-5 z-30">
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

      <div className="py-6 animate-in fade-in duration-300">
        <ArtworkGrid
          artworks={filteredArtworks}
          sessionId={user ? user.id : undefined}
          handleDownload={downloadArtwork}
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
