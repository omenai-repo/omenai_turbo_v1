// components/programming/SelectableArtworkCard.tsx
import React from "react";
import Image from "next/image";
import { ArtistSchemaTypes, ArtworkSchemaTypes } from "@omenai/shared-types";
import { getOptimizedImage } from "@omenai/shared-lib/storage/getImageFileView";

interface SelectableArtworkCardProps {
  artwork: ArtworkSchemaTypes;
  isSelected: boolean;
  onToggle: (artworkId: string, artistId: string, artistName: string) => void;
  isAlreadyFeatured?: boolean;
}

export const SelectableArtworkCard = ({
  artwork,
  isSelected,
  onToggle,
  isAlreadyFeatured,
}: SelectableArtworkCardProps) => {
  const image_href = getOptimizedImage(artwork.url, "small");
  const safeArtistId = artwork.artist || artwork.art_id;
  const safeArtistName = artwork.artist || "Unknown Artist";

  return (
    <div
      onClick={() =>
        !isAlreadyFeatured &&
        onToggle(artwork.art_id, safeArtistId, safeArtistName)
      }
      className={`group relative transition-all duration-300 rounded-sm overflow-hidden border-2 ${
        isAlreadyFeatured
          ? "border-transparent opacity-50 cursor-not-allowed grayscale-[50%]"
          : isSelected
            ? "border-dark shadow-md cursor-pointer"
            : "border-transparent hover:border-neutral-200 cursor-pointer"
      }`}
    >
      <div className="relative w-full aspect-square bg-neutral-100">
        <Image
          src={image_href}
          alt={artwork.title}
          fill
          className={`object-cover transition-all duration-500 ${isSelected ? "scale-105 opacity-90" : "group-hover:scale-105"}`}
        />

        {isAlreadyFeatured && (
          <div className="absolute inset-0 bg-white/40 flex items-center justify-center backdrop-blur-[1px]">
            <span className="bg-dark text-white px-3 py-1 text-[9px] uppercase tracking-widest rounded-sm font-medium">
              Already Featured
            </span>
          </div>
        )}

        {/* Elegant Checkbox Indicator */}
        <div
          className={`absolute top-3 right-3 w-5 h-5 rounded-sm -full border flex items-center justify-center transition-colors duration-300 ${
            isSelected
              ? "bg-dark border-dark text-white"
              : "bg-white/80 border-neutral-300 backdrop-blur-sm"
          }`}
        >
          {isSelected && (
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}
        </div>
      </div>

      <div
        className={`p-3 bg-white transition-colors ${isSelected ? "bg-neutral-50" : ""}`}
      >
        <p className="text-xs font-medium text-dark line-clamp-1">
          {artwork.artist}
        </p>
        <p className="text-[10px] text-neutral-500 italic line-clamp-1">
          {artwork.title}, {artwork.year}
        </p>
      </div>
    </div>
  );
};
