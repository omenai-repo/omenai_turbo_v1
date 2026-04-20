// components/programming/ArtworkSelectorModal.tsx
import React, { useState, useEffect, useCallback } from "react";
import { Search } from "lucide-react";
import { SelectableArtworkCard } from "./SelectableArtworkCard";
import { CreateGalleryEventPayload } from "@omenai/shared-lib/zodSchemas/GalleryEventValidationSchema";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { fetchInventory } from "@omenai/shared-services/gallery/events/fetchInventory"; // Your actual fetch function

interface ArtworkSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  galleryId: string;
  validatedPayload: CreateGalleryEventPayload | null;
  onFinalSubmit: (finalPayload: CreateGalleryEventPayload) => Promise<void>;
  alreadyFeaturedIds?: string[];
}

export const ArtworkSelectorModal = ({
  isOpen,
  onClose,
  galleryId,
  validatedPayload,
  onFinalSubmit,
  alreadyFeaturedIds = [],
}: ArtworkSelectorModalProps) => {
  const [availableArtworks, setAvailableArtworks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { csrf } = useAuth({ requiredRole: "gallery" });

  // -- State: Pagination & Search --
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [selectedArtworks, setSelectedArtworks] = useState<Set<string>>(
    new Set(),
  );
  const [selectedArtists, setSelectedArtists] = useState<
    Map<string, { name: string; count: number }>
  >(new Map());

  // 1. Debounce Search Input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // 2. Data Fetching Logic
  const loadInventory = useCallback(
    async (pageNum: number, search: string, isAppend = false) => {
      if (!isAppend) setIsLoading(true);

      try {
        // Execute the fetch to the API route we built
        const response = await fetchInventory(
          galleryId,
          pageNum,
          "20",
          search,
          csrf || "",
        );

        if (response.isOk) {
          if (isAppend) {
            setAvailableArtworks((prev) => [...prev, ...response.results]);
          } else {
            setAvailableArtworks(response.results);
          }
          setHasMore(response.pagination.hasMore);
        }
      } catch (error) {
        console.error("Failed to load inventory", error);
      } finally {
        setIsLoading(false);
      }
    },
    [galleryId],
  );

  // 3. Trigger Fetch on Open or Search Change
  useEffect(() => {
    if (isOpen) {
      setPage(1);
      loadInventory(1, debouncedSearch, false);
    }
  }, [isOpen, debouncedSearch, loadInventory]);

  // 4. Selection Logic
  const handleToggleArtwork = (
    artworkId: string,
    artistId: string,
    artistName: string,
  ) => {
    // Toggle the artwork ID (Stays the same)
    setSelectedArtworks((prev) => {
      const next = new Set(prev);
      if (next.has(artworkId)) next.delete(artworkId);
      else next.add(artworkId);
      return next;
    });

    // Smart Artist Tracking
    setSelectedArtists((prev) => {
      const next = new Map(prev);
      const existingArtist = next.get(artistId);

      // If the artwork is already selected, it means we are DESELECTING it now
      if (selectedArtworks.has(artworkId)) {
        if (existingArtist && existingArtist.count > 1) {
          // Decrease count
          next.set(artistId, {
            ...existingArtist,
            count: existingArtist.count - 1,
          });
        } else {
          // Count reached 0, remove the artist entirely
          next.delete(artistId);
        }
      } else {
        // We are SELECTING the artwork
        if (existingArtist) {
          next.set(artistId, {
            ...existingArtist,
            count: existingArtist.count + 1,
          });
        } else {
          // First time selecting this artist
          next.set(artistId, { name: artistName, count: 1 });
        }
      }
      return next;
    });
  };

  // 5. Final Submission Logic
  const handleConfirmAndPublish = async () => {
    setIsSubmitting(true);

    // If validatedPayload exists, we are in Create Mode.
    // If not, we are in Dashboard Mode and just need the artworks.
    const finalPayload = validatedPayload
      ? {
          ...validatedPayload,
          featured_artworks: Array.from(selectedArtworks),
          participating_artists: Array.from(selectedArtists.keys()),
        }
      : {
          featured_artworks: Array.from(selectedArtworks),
          participating_artists: Array.from(selectedArtists.keys()),
        };

    // We cast to any here because your Dashboard handler expects a different shape
    // than your Create handler
    await onFinalSubmit(finalPayload as any);
    setIsSubmitting(false);
    onClose();
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm transition-opacity"
        onClick={!isSubmitting ? onClose : undefined}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-6xl h-[90vh] bg-white rounded-sm  shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-neutral-100 shrink-0">
          <div>
            <h2 className="text-xl font-light text-dark">Curate Inventory</h2>
            <p className="text-[11px] uppercase tracking-widest text-neutral-500 mt-1">
              {selectedArtworks.size} works selected
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="text-neutral-400 hover:text-dark transition-colors disabled:opacity-50"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-8 py-4 border-b border-neutral-100 bg-white shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by artwork title or artist name..."
              className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-sm  text-sm focus:outline-none focus:border-dark focus:ring-1 focus:ring-dark transition-all"
            />
          </div>
        </div>
        {selectedArtists.size > 0 && (
          <div className="px-8 py-3 bg-neutral-50/80 border-b border-neutral-100 shrink-0 flex items-center gap-3 overflow-x-auto custom-scrollbar">
            <span className="text-[10px] uppercase tracking-widest text-neutral-500 whitespace-nowrap">
              Featuring Artists:
            </span>
            <div className="flex gap-2">
              {Array.from(selectedArtists).map(([artistId, data]) => (
                <div
                  key={artistId}
                  className="animate-in fade-in zoom-in duration-200 px-3 py-1 bg-white border border-neutral-200 rounded-sm -full text-xs font-medium text-dark whitespace-nowrap shadow-sm flex items-center gap-1.5"
                >
                  {/* Now we explicitly access data.name */}
                  <span>{data.name}</span>
                  <span className="text-[10px] text-neutral-400 font-light">
                    ({data.count})
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Grid Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 bg-neutral-50/50">
          {isLoading ? (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-[10px] tracking-[0.2em] uppercase text-neutral-400">
                Loading inventory...
              </span>
            </div>
          ) : availableArtworks.length === 0 ? (
            <div className="w-full h-full flex flex-col items-center justify-center text-center">
              <p className="text-sm font-medium text-dark mb-1">
                No matching artworks
              </p>
              <p className="text-xs text-neutral-500 max-w-sm">
                Try adjusting your search, or ensure your inventory isn't
                already assigned to other active events.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {availableArtworks.map((artwork) => (
                  <SelectableArtworkCard
                    key={artwork.art_id} // Matches your DB schema ID
                    artwork={artwork}
                    isSelected={selectedArtworks.has(artwork.art_id)}
                    onToggle={handleToggleArtwork}
                    isAlreadyFeatured={alreadyFeaturedIds.includes(
                      artwork.art_id,
                    )}
                  />
                ))}
              </div>

              {/* Load More Button */}
              {hasMore && (
                <div className="mt-12 mb-4 flex justify-center">
                  <button
                    onClick={() => {
                      const nextPage = page + 1;
                      setPage(nextPage);
                      loadInventory(nextPage, debouncedSearch, true);
                    }}
                    className="px-8 py-3 border border-neutral-200 text-[10px] font-medium tracking-widest uppercase hover:border-dark hover:text-dark transition-colors rounded-sm  text-neutral-500 bg-white"
                  >
                    Load More Artworks
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-neutral-100 shrink-0 flex items-center justify-between bg-white">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-xs font-medium tracking-widest uppercase text-neutral-500 hover:text-dark transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleConfirmAndPublish}
            disabled={isSubmitting || selectedArtworks.size === 0}
            className="bg-dark text-white px-8 py-3 text-xs font-medium tracking-widest uppercase hover:bg-neutral-800 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-sm "
          >
            {isSubmitting
              ? validatedPayload
                ? "Publishing Event..."
                : "Adding Works..."
              : validatedPayload
                ? "Publish Event"
                : "Add Works"}
          </button>
        </div>
      </div>
    </div>
  );
};
