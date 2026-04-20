import React from "react";
import { RosterArtist } from "@omenai/shared-types";

interface ConfirmRemoveModalProps {
  artist: RosterArtist | null;
  isOpen: boolean;
  isRemoving: boolean;
  onClose: () => void;
  onConfirm: (artistId: string) => void;
}

export const ConfirmRemoveModal = ({
  artist,
  isOpen,
  isRemoving,
  onClose,
  onConfirm,
}: ConfirmRemoveModalProps) => {
  if (!isOpen || !artist) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
      <div className="bg-white border border-neutral-200 shadow-2xl w-full max-w-md p-8 sm:p-10 relative rounded-sm   animate-in fade-in zoom-in-95 duration-300">
        {/* Warning Icon */}
        <div className="w-12 h-12 bg-red-50 rounded-sm -full flex items-center justify-center mb-6">
          <svg
            className="w-5 h-5 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        <h3 className="text-xl font-medium text-neutral-900 mb-2">
          Remove {artist.name}?
        </h3>

        <p className="text-sm text-neutral-500 mb-8 leading-relaxed">
          Are you sure you want to remove this artist from your roster? Any
          artworks they have previously uploaded will remain on the platform,
          but they will no longer be listed as actively managed by your gallery.
        </p>

        <div className="flex gap-4 w-full">
          <button
            onClick={onClose}
            disabled={isRemoving}
            className="w-1/2 border border-neutral-300 text-neutral-700 px-4 py-3 text-xs font-medium tracking-widest uppercase hover:bg-neutral-50 hover:text-neutral-900 transition-colors duration-300 rounded-sm   disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(artist.artist_id)}
            disabled={isRemoving}
            className="w-1/2 bg-red-600 text-white px-4 py-3 text-xs font-medium tracking-widest uppercase hover:bg-red-700 transition-colors duration-300 disabled:opacity-50 flex justify-center items-center rounded-sm  "
          >
            {isRemoving ? "Removing..." : "Remove"}
          </button>
        </div>
      </div>
    </div>
  );
};
