"use client";

import { actionStore } from "@omenai/shared-state-store/src/actions/ActionStore";
import { getApiUrl } from "@omenai/url-config/src/config";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";

const DynamicZoomableViewerComponentWithNoSSR = dynamic(
  () =>
    import("../components/OpenSeaDragonZoomable").then(
      (mod) => mod.ZoomableViewer
    ),
  { ssr: false }
);
const ZoomableViewerModal = ({ fileUrl }: { fileUrl: string }) => {
  const {
    openSeadragonImageViewer,
    setOpenSeaDragonImageViewer,
    seaDragonZoomableImageViewerUrl,
  } = actionStore();

  if (!openSeadragonImageViewer) return null;

  return (
    <div className="w-[100vw] h-[100svh] fixed inset-0 z-50 flex items-center justify-center bg-dark">
      <div className="rounded-lg shadow-lg p-4 max-w-full w-full h-full">
        <button
          onClick={() => setOpenSeaDragonImageViewer(false)}
          className="absolute top-4 right-4 text-white bg-dark p-5 z-50 hover:text-white"
        >
          ✕
        </button>
        <DynamicZoomableViewerComponentWithNoSSR dziUrl={fileUrl} />
      </div>
    </div>
  );
};

export default ZoomableViewerModal;
