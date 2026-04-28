// app/galleries/page.tsx
"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useInfiniteQuery } from "@tanstack/react-query";
import {
  getOptimizedImage,
  getOptimizedLogoImage,
} from "@omenai/shared-lib/storage/getImageFileView";
import { fetchGalleries } from "@omenai/shared-services/gallery/fetchGalleries";
import FollowComponent from "@omenai/shared-ui-components/components/likes/FollowComponent";
import { GallerySchemaTypes } from "@omenai/shared-types";

const fetchAllGalleries = async () => {
  const response = await fetchGalleries(1, 15);
  if (!response.isOk) {
    throw new Error("Failed to fetch all galleries");
  }
  return { data: response.data, pagination: response.pagination };
};

export default function AllGalleriesDirectory() {
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["allGalleriesDirectory"],
    queryFn: fetchAllGalleries,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (
        lastPage?.pagination &&
        lastPage.pagination.page < lastPage.pagination.totalPages
      ) {
        return lastPage.pagination.page + 1;
      }
      return undefined;
    },
    staleTime: 1000 * 60 * 5,
  });

  const cleanedGalleryList = useMemo(() => {
    const allGalleries = data?.pages.flatMap((page) => page?.data || []) || [];

    return allGalleries.filter(
      (gallery: GallerySchemaTypes) =>
        gallery.name.toLowerCase() !== "omenai gallery" ||
        gallery.name.toLowerCase() !== "ankh gallery",
    );
  }, [data]);

  return (
    <div className="w-full max-w-[1600px] mx-auto p-4 md:p-8">
      {/* Page Header */}
      <div className="mb-16 border-b border-neutral-100 pb-12">
        <h1 className="font-serif text-2xl md:text-3xl lg:text-4xl text-dark font-light mb-4">
          Gallery Directory
        </h1>
        <p className="font-sans text-sm text-neutral-500 tracking-wide">
          Explore our global Gallery partners
        </p>
      </div>

      {/* Directory Grid */}
      {isLoading ? (
        <div className="py-32 text-center text-neutral-400 font-sans text-xs uppercase tracking-widest animate-pulse">
          Loading Directory...
        </div>
      ) : isError ? (
        <div className="py-32 text-center text-neutral-400 font-sans text-xs uppercase tracking-widest">
          Failed to load galleries.
        </div>
      ) : cleanedGalleryList.length === 0 ? (
        <div className="py-32 text-center text-neutral-400 font-sans text-xs uppercase tracking-widest">
          No galleries available at this time.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-12">
            {cleanedGalleryList.map((gallery: any) => {
              const locationStr = [gallery.address?.country]
                .filter(Boolean)
                .join(", ");

              const isOmitGallery =
                gallery.name.toLowerCase() === "omenai gallery";
              if (isOmitGallery) return null;
              return (
                <Link
                  href={`/partners/${gallery.gallery_id}`}
                  key={gallery.gallery_id}
                  className="group flex flex-col min-w-[350px] h-[300px]"
                >
                  {/* Gallery Cover Box - Edge to Edge */}
                  <div className="w-full aspect-[4/3] bg-neutral-100 mb-4 relative overflow-hidden rounded-sm">
                    {gallery.logo ? (
                      <img
                        src={getOptimizedLogoImage(gallery.logo, "medium")}
                        alt={gallery.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-serif text-4xl text-neutral-300 italic">
                        {gallery.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  {/* Gallery Info - Left Aligned */}
                  <div className="flex justify-between items-center gap-x-4">
                    <div className="w-full pr-4">
                      <h3 className="font-serif text-sm text-dark group-hover:text-neutral-500 transition-colors truncate">
                        {gallery.name}
                      </h3>
                      {locationStr && (
                        <p className="font-sans text-[10px] text-neutral-400 uppercase tracking-[0.15em] mt-1.5 truncate">
                          {locationStr}
                        </p>
                      )}
                    </div>

                    <FollowComponent
                      followerCount={gallery.followerCount}
                      entityId={gallery.gallery_id}
                      entityType="gallery"
                    />
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Load More Button */}
          {hasNextPage && (
            <div className="mt-24 flex justify-center border-t border-neutral-100 pt-16">
              <button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="font-sans text-xs uppercase tracking-widest font-medium text-dark border border-neutral-200 px-10 py-4 hover:border-dark hover:bg-neutral-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded-sm"
              >
                {isFetchingNextPage ? "Loading..." : "Load More Galleries"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
