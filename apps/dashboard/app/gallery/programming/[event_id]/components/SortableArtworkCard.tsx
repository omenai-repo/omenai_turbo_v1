import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ArtworkSchemaTypes } from "@omenai/shared-types";
import { getOptimizedImage } from "@omenai/shared-lib/storage/getImageFileView";

// 1. The Sortable Card Component
// ----------------------------------------------------------------------
export const SortableArtworkCard = ({
  artwork,
  isRemoving,
  onRemoveClick,
}: any) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: artwork.art_id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group flex flex-col space-y-3 relative"
    >
      {/* DRAG HANDLE: Sits top-right, z-30 ensures it stays above the remove overlay */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-3 right-3 z-30 p-1.5 bg-white/90 backdrop-blur-sm text-dark rounded-sm cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity shadow-sm border border-neutral-200"
        title="Drag to reorder"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4 8h16M4 16h16"
          />
        </svg>
      </div>

      {/* Image Container */}
      <div className="relative aspect-square w-full bg-neutral-100 overflow-hidden rounded-sm border border-neutral-200 shadow-sm group-hover:border-dark transition-colors duration-300">
        <img
          src={getOptimizedImage(artwork.url, "small")}
          alt={artwork.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {!artwork.availability && (
          <div className="absolute top-3 left-3 px-2 py-1 bg-dark text-white text-[9px] uppercase tracking-widest font-medium rounded-sm z-20">
            Sold
          </div>
        )}

        {/* Hover Overlay with Remove Action (z-10 so drag handle stays on top) */}
        <div
          className={`absolute inset-0 bg-white/80 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px] ${
            isRemoving === artwork.art_id
              ? "opacity-100 z-10"
              : "opacity-0 group-hover:opacity-100 z-10"
          }`}
        >
          <button
            onClick={(e) => {
              e.stopPropagation(); // Prevents dragging when clicking remove
              onRemoveClick(artwork.art_id);
            }}
            disabled={isRemoving === artwork.art_id}
            className="px-4 py-2 bg-red-600 text-white text-[10px] font-medium tracking-widest uppercase rounded-sm hover:bg-red-700 transition-colors disabled:bg-neutral-400 shadow-sm"
          >
            {isRemoving === artwork.art_id ? "Removing..." : "Remove Work"}
          </button>
        </div>
      </div>

      {/* Artwork Metadata */}
      <div className="flex flex-col">
        <span className="text-xs font-medium text-dark truncate">
          {artwork.artist}
        </span>
        <span className="text-xs italic text-neutral-600 truncate">
          {artwork.title}, {artwork.year}
        </span>
        <span className="text-[12px] text-neutral-500 mt-1 uppercase tracking-widest">
          ${artwork.pricing.usd_price.toLocaleString()}
        </span>
      </div>
    </div>
  );
};
