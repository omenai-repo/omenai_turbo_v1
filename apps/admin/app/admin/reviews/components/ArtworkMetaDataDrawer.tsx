import Image from "next/image";
import { X } from "lucide-react";

interface ArtworkMetadataDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  artwork: any;
  imageHref: string;
}

export default function ArtworkMetadataDrawer({
  isOpen,
  onClose,
  artwork,
  imageHref,
}: ArtworkMetadataDrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      {/* Drawer Panel */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 border-l border-neutral-200">
        <div className="p-6 border-b border-neutral-100 flex justify-between items-center bg-neutral-50">
          <div>
            <h3 className="font-bold text-dark">Artwork Metadata</h3>
            <p className="text-xs text-neutral-500 mt-1">
              Full uploaded details
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-200 rounded -full text-neutral-500 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <div className="relative w-full aspect-square rounded max-h-[300px]  overflow-hidden  ">
            <Image
              src={imageHref}
              alt={artwork.title}
              fill
              className="object-contain"
            />
          </div>

          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-neutral-400 font-medium uppercase">
                  Title
                </p>
                <p className="text-sm font-medium text-dark">{artwork.title}</p>
              </div>

              <div>
                <p className="text-xs text-neutral-400 font-medium uppercase">
                  Artist
                </p>
                <p className="text-sm font-medium text-dark">
                  {artwork.artist}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-neutral-400 font-medium uppercase">
                  Medium
                </p>
                <p className="text-sm font-medium text-dark">
                  {artwork.medium}
                </p>
              </div>
              <div>
                <p className="text-xs text-neutral-400 font-medium uppercase">
                  Year
                </p>
                <p className="text-sm font-medium text-dark">
                  {artwork.year || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs text-neutral-400 font-medium uppercase">
                  Dimensions
                </p>
                <p className="text-sm font-medium text-dark">
                  {artwork.dimensions
                    ? `${artwork.dimensions.height} x ${artwork.dimensions.width} ${
                        artwork.dimensions.depth
                          ? "x " + artwork.dimensions.depth
                          : ""
                      }`
                    : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs text-neutral-400 font-medium uppercase">
                  Packaging
                </p>
                <p className="text-sm font-medium text-dark capitalize">
                  {artwork.packaging_type || "N/A"}
                </p>
              </div>
            </div>
            <div>
              <p className="text-xs text-neutral-400 font-medium uppercase">
                Materials
              </p>
              <p className="text-sm font-medium text-dark">
                {artwork.materials || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-xs text-neutral-400 font-medium uppercase">
                Description
              </p>
              <p className="text-sm text-neutral-600 leading-relaxed max-h-40 overflow-y-auto pr-2">
                {artwork.description || "No description provided."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
