"use client";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import { artworkActionStore } from "@omenai/shared-state-store/src/artworks/ArtworkActionStore";
import { artworkStore } from "@omenai/shared-state-store/src/artworks/ArtworkStore";
import { filterStore } from "@omenai/shared-state-store/src/artworks/FilterStore";
import { fetchPaginatedArtworks } from "@omenai/shared-services/artworks/fetchPaginatedArtworks";
import NotFoundData from "@omenai/shared-ui-components/components/notFound/NotFoundData";
import { AdminArtworkSkeleton } from "@omenai/shared-ui-components/components/skeletons/AdminArtworkSkeleton";
import Pagination from "@omenai/shared-ui-components/components/pagination/Pagination";
import ArtworkCard from "@omenai/shared-ui-components/components/artworks/ArtworkCard";
import { Download } from "lucide-react";
import { getOptimizedImage } from "@omenai/shared-lib/storage/getImageFileView";
import { toast_notif } from "@omenai/shared-utils/src/toast_notification";
import { ArtworkSchemaTypes } from "@omenai/shared-types";
import { catalogChunk } from "@omenai/shared-utils/src/createCatalogChunks";
import { useWindowSize } from "usehooks-ts";

export default function ArtworkListing() {
  const [viewMode, setViewMode] = useState<"gallery" | "artist">("gallery");
  const { currentPage, setCurrentPage } = artworkActionStore();
  const { user } = useAuth({ requiredRole: "admin" });
  const [isDownloading, setIsDownloading] = useState(false);

  const {
    isLoading,
    setArtworks,
    setIsLoading,
    artworks,
    artwork_total,
    set_artwork_total,
    setPageCount,
    pageCount,
  } = artworkStore();
  const { filterOptions } = filterStore();
  const { width } = useWindowSize();
  const { data: artworksArray, isLoading: loading } = useQuery({
    queryKey: ["get_paginated_artworks"],
    queryFn: async () => {
      const response = await fetchPaginatedArtworks(currentPage, filterOptions);
      if (response?.isOk) {
        setArtworks(response.data);
        set_artwork_total(response.total);
        setPageCount(response.count);
        return { data: response.data, pages: response.count };
      } else throw new Error("Failed to fetch artworks");
    },
    staleTime: 30 * 60 * 1000, // Data is fresh for 5 minutes
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false, // Don't refetch if we have cached data
  });

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
  const arts = catalogChunk(
    artworks,
    width <= 640 ? 1 : width <= 990 ? 2 : width <= 1440 ? 3 : 4,
  );
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
      {viewMode === "gallery" && (
        <div className="p-6 md:p-8 animate-in fade-in duration-300">
          <div className="w-full my-3">
            <div className="flex flex-wrap gap-x-4 justify-center">
              {arts.map((artworks: any[], index) => {
                return (
                  <div className="flex-1 gap-2 space-y-6" key={index}>
                    {artworks
                      .filter((art) => art.role_access.role === "gallery")
                      .map((art: any) => {
                        return (
                          <div key={art.art_id} className="relative">
                            <button
                              disabled={isDownloading}
                              onClick={() => downloadArtwork(art)}
                              className="absolute bg-white disabled:bg-white/50 top-4 right-2 p-2 rounded-full z-10 cursor-pointer"
                            >
                              <Download size={18} />
                            </button>
                            <ArtworkCard
                              key={art.art_id}
                              image={art.url}
                              name={art.title}
                              artist={art.artist}
                              art_id={art.art_id}
                              pricing={art.pricing}
                              impressions={art.impressions as number}
                              likeIds={art.like_IDs as string[]}
                              sessionId={user ? user.id : undefined}
                              availability={art.availability}
                              medium={art.medium}
                              author_id={art.author_id}
                            />
                          </div>
                        );
                      })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
      {viewMode === "artist" && (
        <div className="p-6 md:p-8 animate-in fade-in duration-300">
          <div className="w-full my-3">
            <div className="flex flex-wrap gap-x-4 justify-center">
              {arts.map((artworks: any[], index) => {
                return (
                  <div className="flex-1 gap-2 space-y-6" key={index}>
                    {artworks
                      .filter((art) => art.role_access.role === "artist")
                      .map((art: any) => {
                        return (
                          <div key={art.art_id} className="relative">
                            <button
                              disabled={isDownloading}
                              onClick={() => downloadArtwork(art)}
                              className="absolute bg-white disabled:bg-white/50 top-4 right-2 p-2 rounded-full z-10 cursor-pointer"
                            >
                              <Download size={18} />
                            </button>
                            <ArtworkCard
                              key={art.art_id}
                              image={art.url}
                              name={art.title}
                              artist={art.artist}
                              art_id={art.art_id}
                              pricing={art.pricing}
                              impressions={art.impressions as number}
                              likeIds={art.like_IDs as string[]}
                              sessionId={user ? user.id : undefined}
                              availability={art.availability}
                              medium={art.medium}
                              author_id={art.author_id}
                            />
                          </div>
                        );
                      })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
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
