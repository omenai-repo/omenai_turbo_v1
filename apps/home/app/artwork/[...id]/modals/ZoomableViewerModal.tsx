"use client";

import { actionStore } from "@omenai/shared-state-store/src/actions/ActionStore";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { MdClose } from "react-icons/md";

const DynamicZoomableViewerComponentWithNoSSR = dynamic(
  () =>
    import("../components/OpenSeaDragonZoomable").then(
      (mod) => mod.ZoomableViewer
    ),
  { ssr: false }
);

const ZoomableViewerModal = ({ fileUrl }: { fileUrl: string }) => {
  const { openSeadragonImageViewer, setOpenSeaDragonImageViewer } =
    actionStore();
  const [mounted, setMounted] = useState(false);

  // 1. Wait for mount to access document (Client-side only)
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // 2. SCROLL LOCK LOGIC (The Nuclear Option)
  useEffect(() => {
    if (openSeadragonImageViewer) {
      const scrollY = window.scrollY;
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
    } else {
      const scrollY = document.body.style.top;
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      window.scrollTo(0, parseInt(scrollY || "0") * -1);
    }

    return () => {
      const scrollY = document.body.style.top;
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      window.scrollTo(0, parseInt(scrollY || "0") * -1);
    };
  }, [openSeadragonImageViewer]);

  // 3. Don't render until client-side mount
  if (!mounted || !openSeadragonImageViewer) return null;

  // 4. THE PORTAL: Teleports this div to document.body
  return createPortal(
    <div className="fixed inset-0 z-[99999] flex h-screen w-screen items-center justify-center bg-dark backdrop-blur-sm">
      {/* CLOSE BUTTON */}
      <button
        onClick={() => setOpenSeaDragonImageViewer(false)}
        className="absolute right-0 top-0 z-[100000] flex h-16 w-16 items-center justify-center bg-dark text-white hover:bg-neutral-800 transition-colors duration-300"
      >
        <MdClose className="text-2xl" />
      </button>

      {/* VIEWER WRAPPER */}
      <div className="relative h-full w-full">
        <DynamicZoomableViewerComponentWithNoSSR dziUrl={fileUrl} />
      </div>
    </div>,
    document.body // Target container
  );
};

export default ZoomableViewerModal;
