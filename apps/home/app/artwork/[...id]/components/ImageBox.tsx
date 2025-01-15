"use client";
import { getImageFileView } from "@omenai/shared-lib/storage/getImageFileView";
import Load from "@omenai/shared-ui-components/components/loader/Load";
import Image from "next/image";
import { useState, useRef } from "react";

type ImageBoxProps = {
  url: string;
  title: string;
};

export default function ImageBox({ url, title }: ImageBoxProps) {
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [zoomScale, setZoomScale] = useState(1);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const initialImageRender = getImageFileView(url, 1000);
  const highResImageRender = getImageFileView(url, 1500);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (!containerRef.current) return;
    setZoomScale(2);

    requestAnimationFrame(() => {
      const rect = containerRef.current!.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      setPosition({ x, y });
    });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 50, y: 50 });
    setZoomScale(1);
  };

  return (
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
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                onLoad={() => setLoading(false)}
                style={{
                  transform: `scale(${zoomScale})`,
                  transformOrigin: `${position.x}% ${position.y}%`,
                  transition: "transform 0.4s ease, transform-origin 0.2s ease",
                  overflow: "hidden",
                  touchAction: "none",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
