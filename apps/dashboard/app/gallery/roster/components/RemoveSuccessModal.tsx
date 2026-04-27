import React from "react";
import Image from "next/image";
import { RosterArtist } from "@omenai/shared-types";
import { getGalleryLogoFileView } from "@omenai/shared-lib/storage/getGalleryLogoFileView";

interface RemoveSuccessModalProps {
  artist: RosterArtist | null;
  onClose: () => void;
}

export const RemoveSuccessModal = ({
  artist,
  onClose,
}: RemoveSuccessModalProps) => {
  if (!artist) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
      <div className="bg-white border border-neutral-200 shadow-2xl w-full max-w-lg p-8 sm:p-12 relative rounded-sm   flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-300">
        {/* Minimalist Checkmark */}
        <div className="w-12 h-12 bg-neutral-900 rounded-sm -full flex items-center justify-center mb-8">
          <svg
            className="w-5 h-5 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        {/* Artist Disambiguator UI */}
        <div className="h-20 w-20 shrink-0 rounded-sm -full bg-neutral-100 border border-neutral-200 overflow-hidden flex items-center justify-center mb-5">
          {artist.logo ? (
            <Image
              src={getGalleryLogoFileView(artist.logo, 200)}
              alt={artist.name}
              width={80}
              height={80}
              className="object-cover w-full h-full"
            />
          ) : (
            <span className="text-xl font-medium tracking-wider text-neutral-500">
              {artist.name.substring(0, 2).toUpperCase()}
            </span>
          )}
        </div>

        <h3 className="text-2xl font-normal text-neutral-900 mb-2">
          {artist.name}
        </h3>

        <p className="text-sm text-neutral-500 mb-10 tracking-wide">
          Has been successfully removed from your roster of represented artists.
        </p>

        <button
          onClick={onClose}
          className="w-full border border-neutral-900 text-neutral-900 px-6 py-4 text-xs font-medium tracking-widest uppercase hover:bg-neutral-50 transition-colors duration-300 rounded-sm  "
        >
          Done
        </button>
      </div>
    </div>
  );
};
