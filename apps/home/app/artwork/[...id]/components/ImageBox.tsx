"use client";
import { getOptimizedImage } from "@omenai/shared-lib/storage/getImageFileView";
import Load from "@omenai/shared-ui-components/components/loader/Load";
import { useState } from "react";
import { actionStore } from "@omenai/shared-state-store/src/actions/ActionStore";
import ZoomableViewerModal from "../modals/ZoomableViewerModal";
import { MdZoomIn } from "react-icons/md";
import RoomViewModal from "./RoomView";
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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const myArtUrl =
    "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/1200px-Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg";

  return (
    <div className="">
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
          className={`h-auto w-full max-h-[100vh] object-contain transition-opacity duration-700 ${
            loading ? "opacity-0" : "opacity-100"
          }`}
          onLoad={() => setLoading(false)}
        />

        {/* Hover Overlay: "Inspect" */}
        <div className="absolute bottom-6 right-6 flex items-center gap-2 bg-white/90 backdrop-blur px-4 py-2 border border-neutral-200">
          <MdZoomIn className="text-lg" />
          <span className="font-mono text-[9px] uppercase tracking-widest text-dark">
            Inspect Plate
          </span>
        </div>
      </div>
      {/* <div className="p-10">
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-black text-white px-6 py-3 rounded-lg font-bold hover:bg-gray-800 transition-colors flex items-center gap-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          View in Room
        </button>

        <RoomViewModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          artUrl={myArtUrl}
        />
      </div> */}
    </div>
  );
}
