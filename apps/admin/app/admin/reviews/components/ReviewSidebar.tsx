import { getOptimizedImage } from "@omenai/shared-lib/storage/getImageFileView";
import { formatPrice } from "@omenai/shared-utils/src/priceFormatter";
import { Clock, ChevronRight, Search, ChevronLeft } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface ReviewSidebarProps {
  reviews: any[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  isLoading: boolean;
  isFetching: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onSearch: (artistId: string) => void;
}

export default function ReviewSidebar({
  reviews,
  selectedId,
  onSelect,
  isLoading,
  isFetching,
  currentPage,
  totalPages,
  onPageChange,
  onSearch,
}: ReviewSidebarProps) {
  const [searchInput, setSearchInput] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchInput.trim());
  };

  return (
    <div className="flex flex-col h-full bg-neutral-50/50 border-r border-neutral-200 relative">
      {/* 1. Sticky Header with Search */}
      <div className="p-4 border-b border-neutral-200 bg-white sticky top-0 z-10 space-y-3">
        <h2 className="text-sm font-bold text-dark uppercase tracking-wider flex justify-between items-center">
          <span>Price review requests</span>
          {isFetching && (
            <span className="text-[10px] text-neutral-400 normal-case animate-pulse">
              Updating...
            </span>
          )}
        </h2>

        <form onSubmit={handleSearchSubmit} className="relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
          />
          <input
            type="text"
            placeholder="Search by Artist ID..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded -lg focus:outline-none focus:border-dark focus:ring-1 focus:ring-dark transition-all"
          />
        </form>
      </div>

      {/* 2. Scrollable Queue Area */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-6 text-sm text-neutral-500 text-center">
            Loading queue...
          </div>
        ) : reviews.length === 0 ? (
          <div className="p-8 text-center flex flex-col items-center justify-center h-full opacity-60">
            <div className="w-12 h-12 bg-neutral-100 rounded -full flex items-center justify-center mb-3">
              <Clock size={20} className="text-neutral-400" />
            </div>
            <p className="text-sm font-medium text-dark">Inbox Zero</p>
            <p className="text-xs text-neutral-500 mt-1">
              No pending price reviews.
            </p>
          </div>
        ) : (
          <div
            className={`flex flex-col transition-opacity duration-200 ${isFetching ? "opacity-50" : "opacity-100"}`}
          >
            {reviews.map((review) => {
              const isSelected = selectedId === review._id;
              const { artwork } = review.meta;
              const image_href = getOptimizedImage(artwork.url, "small");

              return (
                <button
                  key={review._id}
                  onClick={() => onSelect(review._id)}
                  className={`w-full text-left p-4 border-b border-neutral-100 transition-all flex items-center justify-between gap-3 ${
                    isSelected
                      ? "bg-white border-l-4 border-l-dark shadow-sm"
                      : "hover:bg-white border-l-4 border-l-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="relative w-16 h-16 rounded bg-neutral-200 shrink-0 overflow-hidden">
                      <Image
                        src={image_href}
                        alt={artwork.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="truncate">
                      <p
                        className={`text-sm font-bold truncate ${isSelected ? "text-dark" : "text-neutral-700"}`}
                      >
                        {artwork.title}
                      </p>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        Requested Price:{" "}
                        <span className="font-semibold text-amber-600">
                          {formatPrice(
                            review.artist_review.requested_price,
                            "USD",
                          )}
                        </span>
                      </p>
                    </div>
                  </div>
                  <ChevronRight
                    size={16}
                    className={isSelected ? "text-dark" : "text-neutral-300"}
                  />
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Sticky Pagination Footer */}
      {totalPages > 1 && (
        <div className="p-3 border-t border-neutral-200 bg-white sticky bottom-0 z-10 flex items-center justify-between">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1 || isFetching}
            className="p-1.5 rounded border border-neutral-200 hover:bg-neutral-50 disabled:opacity-50 text-dark transition-colors"
          >
            <ChevronLeft size={16} />
          </button>

          <span className="text-xs text-neutral-500 font-medium">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages || isFetching}
            className="p-1.5 rounded border border-neutral-200 hover:bg-neutral-50 disabled:opacity-50 text-dark transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
