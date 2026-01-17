"use client";
import { getOptimizedImage } from "@omenai/shared-lib/storage/getImageFileView";
import Load from "@omenai/shared-ui-components/components/loader/Load";
import { useState } from "react";
import { actionStore } from "@omenai/shared-state-store/src/actions/ActionStore";
import ZoomableViewerModal from "../modals/ZoomableViewerModal";
import { MdZoomIn } from "react-icons/md";

type ImageBoxProps = {
  url: string;
  title: string;
};

export default function ImageBox({ url, title }: ImageBoxProps) {
  const [loading, setLoading] = useState(true);
  const { setOpenSeaDragonImageViewer, setSeaDragonZoomableImageViewerUrl } =
    actionStore();

  // Use high quality for the main view
  const initialImageRender = getOptimizedImage(url, "large", 90);
  const highestQualityImage = getOptimizedImage(url, "xlarge", 90);

  const handleClick = () => {
    setSeaDragonZoomableImageViewerUrl(highestQualityImage);
    setOpenSeaDragonImageViewer(true);
  };

  return (
    <>
      <ZoomableViewerModal fileUrl={highestQualityImage} />

      {/* FRAME: No rounded corners, subtle border */}
      <div
        className="group relative w-full overflow-hidden bg-neutral-50 border border-neutral-100 cursor-zoom-in"
        onClick={handleClick}
      >
        {/* Loading State */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-neutral-50">
            <Load />
          </div>
        )}

        {/* Main Image */}
        <img
          src={initialImageRender}
          alt={`${title} - Omenai`}
          className={`h-auto w-full object-contain transition-opacity duration-700 ${
            loading ? "opacity-0" : "opacity-100"
          }`}
          onLoad={() => setLoading(false)}
        />

        {/* Hover Overlay: "Inspect" */}
        <div className="absolute bottom-6 right-6 flex items-center gap-2 bg-white/90 backdrop-blur px-4 py-2 border border-neutral-200 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <MdZoomIn className="text-lg" />
          <span className="font-mono text-[9px] uppercase tracking-widest text-dark">
            Inspect Plate
          </span>
        </div>
      </div>
    </>
  );
}
