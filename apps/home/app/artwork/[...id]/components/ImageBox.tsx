"use client";
import { getImageFileView } from "@omenai/shared-lib/storage/getImageFileView";
import Load from "@omenai/shared-ui-components/components/loader/Load";
import Image from "next/image";
import { useState, useRef } from "react";
import { actionStore } from "@omenai/shared-state-store/src/actions/ActionStore";
import ZoomableViewerModal from "../modals/ZoomableViewerModal";

type ImageBoxProps = {
  url: string;
  title: string;
};

export default function ImageBox({ url, title }: ImageBoxProps) {
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const { setOpenSeaDragonImageViewer, setSeaDragonZoomableImageViewerUrl } =
    actionStore();

  const initialImageRender = getImageFileView(url, 800);
  const highestQualityImage = getImageFileView(url, 1500);

  const handleClick = () => {
    setSeaDragonZoomableImageViewerUrl(highestQualityImage);
    setOpenSeaDragonImageViewer(true);
  };

  return (
    <>
      <ZoomableViewerModal fileUrl={highestQualityImage} />
      <div
        className="relative w-full col-span-12 lg:col-span-8"
        ref={containerRef}
      >
        <div className="relative bg-white">
          <div className="h-full flex justify-center items-center w-full">
            <div className="aspect-auto h-full relative w-full overflow-hidden">
              <div className="w-full h-full">
                {loading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                    <Load />
                  </div>
                )}
                <img
                  src={initialImageRender}
                  alt={`${title} image`}
                  height={800}
                  width={800}
                  className={`h-auto w-full max-h-[800px] object-contain cursor-zoom-in transition-opacity duration-500 ${
                    loading ? "opacity-0" : "opacity-100"
                  }`}
                  onLoad={() => setLoading(false)}
                  onClick={handleClick}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
