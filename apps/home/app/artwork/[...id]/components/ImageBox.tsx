"use client";
import { getImageFileView } from "@omenai/shared-lib/storage/getImageFileView";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";

type ImageBoxProps = {
  url: string;
  title: string;
};

export default function ImageBox({ url, title }: ImageBoxProps) {
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [zoomScale, setZoomScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const [imageSrc, setImageSrc] = useState(getImageFileView(url, 1000)); // Default to low-res

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (!containerRef.current) return;
    setZoomScale(2.2);
    setImageSrc(getImageFileView(url, 1500)); // Replace with higher resolution (e.g., 1500px)

    requestAnimationFrame(() => {
      const rect = containerRef.current!.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      setPosition({ x, y });
    });
  };

  // Handle touch move for mobile
  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;

    // Set zoom scale for mobile
    setZoomScale(2);

    const rect = containerRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    const x = ((touch.clientX - rect.left) / rect.width) * 100;
    const y = ((touch.clientY - rect.top) / rect.height) * 100;

    setPosition({ x, y });
  };

  const handleMouseLeave = () => {
    // Reset to center when not hovering
    setPosition({ x: 50, y: 50 });
    setImageSrc(getImageFileView(url, 800)); // Replace with higher resolution (e.g., 1000px)
    setZoomScale(1);
  };

  const handleTouchEnd = () => {
    setZoomScale(1);
    setPosition({ x: 50, y: 50 }); // Reset position to center
    setImageSrc(getImageFileView(url, 1000)); // Replace with higher resolution (e.g., 1000px)
  };

  return (
    <div
      className="relative w-auto max-w-full h-full max-h-[800px] artContainer"
      style={{}}
      ref={containerRef}
    >
      <img
        src={imageSrc}
        alt={`${title} image`}
        className="md:max-h-[800px] max-w-auto w-full h-full aspect-auto object-contain object-center cursor-pointer artImage"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onTouchMove={handleTouchMove}
        onTouchStart={() => setZoomScale(2)} // Start zoom on touch
        onTouchEnd={handleTouchEnd}
        style={{
          transform: `scale(${zoomScale})`,
          transformOrigin: `${position.x}% ${position.y}%`,
          transition: "transform 0.4s ease, transform-origin 0.2s ease",
          overflow: "hidden",
          touchAction: "none", // Prevent default behavior like scrolling on mobile
        }}
      />
    </div>
  );
}
