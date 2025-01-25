"use client";

import React, {
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
} from "react";
import OpenSeadragon from "openseadragon";
import Load, {
  LoadIcon,
} from "@omenai/shared-ui-components/components/loader/Load";
import { useWindowSize } from "usehooks-ts";

// Interface for component props
interface ZoomableViewerProps {
  dziUrl: string;
}

export const ZoomableViewer: React.FC<ZoomableViewerProps> = ({ dziUrl }) => {
  const viewerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true); // Loading state
  const [zoomLevel, setZoomLevel] = useState(1); // Initial zoom level
  const [viewerInstance, setViewerInstance] =
    useState<OpenSeadragon.Viewer | null>(null);

  // Cache for previously loaded image URLs
  const [imageCache, setImageCache] = useState<Map<string, boolean>>(new Map());

  const { width } = useWindowSize();

  // Memoize the defaultZoomLevel based on window size
  const defaultZoomLevel = useMemo(() => {
    if (width < 460) return 1.2;
    if (width < 1024) return 1;
    if (width < 1280) return 0.8;
    return 0.5;
  }, [width]);

  useEffect(() => {
    if (viewerRef.current) {
      const viewer = OpenSeadragon({
        id: "openseadragon-viewer",
        element: viewerRef.current,
        prefixUrl: "https://openseadragon.github.io/openseadragon/images/",
        tileSources: {
          type: "image",
          url: dziUrl,
        },
        showNavigator: false, // Disable the preview box
        showNavigationControl: false, // Remove navigation controls
        defaultZoomLevel: defaultZoomLevel, // Use memoized value
        immediateRender: true, // Render the image immediately
        showZoomControl: true, // Remove zoom controls
        minZoomLevel: 0.5,
        maxZoomLevel: 2.5, // Allow up to 5x zoom
        visibilityRatio: 1, // Ensure the image fits perfectly within the viewport
        constrainDuringPan: true, // Prevent panning out of bounds
        blendTime: 0, // Disable fade-in animation
      });

      setViewerInstance(viewer);

      // Handle loading state
      viewer.addHandler("open", () => {
        setIsLoading(false);
        setZoomLevel(viewer.viewport.getZoom()); // Set initial zoom level
      });

      // Sync zoom level when the viewer is zoomed via gestures or scroll
      viewer.addHandler("zoom", () => {
        setZoomLevel(viewer.viewport.getZoom());
      });

      return () => {
        viewer.destroy();
      };
    }
  }, [dziUrl, defaultZoomLevel]); // Re-run effect only if dziUrl or defaultZoomLevel changes

  // Use useCallback to memoize the zoom handler function
  const handleZoom = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const zoom = parseFloat(event.target.value);
      setZoomLevel(zoom);
      viewerInstance?.viewport.zoomTo(zoom);
    },
    [viewerInstance] // Recreate handleZoom only when viewerInstance changes
  );

  // Check if image is in cache
  const isImageInCache = useMemo(
    () => imageCache.has(dziUrl),
    [dziUrl, imageCache]
  );

  useEffect(() => {
    // Cache the image URL once it's loaded
    if (isImageInCache) {
      setImageCache((prevCache) => new Map(prevCache.set(dziUrl, true)));
    }
  }, [dziUrl, isImageInCache]);

  return (
    <>
      <div className="relative w-full h-full">
        {/* Loading spinner */}
        {isLoading && (
          <div className="absolute z-10 flex items-center justify-center w-full h-full">
            <div className="w-[100px] h-[100px] p-5 grid place-items-center bg-white rounded-[10px] shadow-lg">
              <LoadIcon />
            </div>
          </div>
        )}
        <div
          className="w-full h-full"
          id="openseadragon-viewer"
          ref={viewerRef}
        />
      </div>

      {/* Zoom slider */}
      <div className="flex translate-x-[-50%] absolute bottom-[30px] left-[50%] max-h-[100%]">
        <div className="w-[240px] h-[30px] rounded-[2px] bg-dark/60 flex justify-center items-center">
          <div className="relative align-middle flex">
            <input
              type="range"
              min="0.5" // Matches minZoomLevel
              max="2.5" // Matches maxZoomLevel
              step="0.1"
              value={zoomLevel} // Controlled input
              className="slider"
              onChange={handleZoom}
            />
          </div>
        </div>
      </div>
    </>
  );
};
