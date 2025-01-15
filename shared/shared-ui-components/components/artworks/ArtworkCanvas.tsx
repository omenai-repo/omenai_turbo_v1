"use client";
/* eslint-disable @next/next/no-img-element */
import { formatPrice } from "@omenai/shared-utils/src/priceFormatter";

import Link from "next/link";
import LikeComponent from "../likes/LikeComponent";

import { getImageFileView } from "@omenai/shared-lib/storage/getImageFileView";
import Image from "next/image";
import { useRef, useState } from "react";
import { base_url } from "@omenai/url-config/src/config";

export default function ArtworkCanvas({
  image,
  artist,
  name,
  pricing,
  impressions,
  likeIds,
  sessionId,
  art_id,
  isDashboard = false,
  availability,
}: {
  image: string;
  artist: string;
  name: string;
  impressions: number;
  likeIds: string[];
  sessionId: string | undefined;
  art_id: string;
  pricing?: {
    price: number;
    usd_price: number;
    shouldShowPrice: "Yes" | "No" | string;
  };
  isDashboard?: boolean;
  availability: boolean;
}) {
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [zoomScale, setZoomScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const [imageSrc, setImageSrc] = useState(getImageFileView(image, 500)); // Default to low-res
  const url = base_url();

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    setZoomScale(2.2);
    setImageSrc(getImageFileView(image, 1500)); // Replace with higher resolution (e.g., 1500px)
    if (!containerRef.current) return;
    else {
      requestAnimationFrame(() => {
        const rect = containerRef.current?.getBoundingClientRect();
        const x = ((e.clientX - rect!.left) / rect!.width) * 100;
        const y = ((e.clientY - rect!.top) / rect!.height) * 100;

        setPosition({ x, y });
      });
    }
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
    setImageSrc(getImageFileView(image, 500)); // Replace with higher resolution (e.g., 1000px)

    setZoomScale(1);
  };

  const handleTouchEnd = () => {
    setZoomScale(1);
    setPosition({ x: 50, y: 50 }); // Reset position to center
  };
  return (
    <div className="my-2 max-w-full p-0 max-h-full">
      <div className="flex flex-col w-full h-full justify-end">
        <div
          className="relative w-full artContainer"
          // onMouseMove={handleMouseMove}
          // onMouseLeave={handleMouseLeave}
          // ref={containerRef}
          // onTouchMove={handleTouchMove}
          // onTouchStart={() => setZoomScale(2)} // Start zoom on touch
          // onTouchEnd={handleTouchEnd}
        >
          <Link href={`${url}/artwork/${name}`} className="relative">
            <Image
              src={imageSrc}
              alt={name + " image"}
              loading="lazy"
              height={500}
              width={500}
              className="w-full h-full aspect-auto object-cover object-center cursor-pointer artImage"
              style={{
                transform: `scale(${zoomScale})`,
                transformOrigin: `${position.x}% ${position.y}%`,
                transition: "transform 0.4s ease, transform-origin 0.2s ease",
              }}
            />
          </Link>
          {isDashboard ? null : (
            <div className="absolute bottom-3 right-3 p-1 rounded-full bg-white border-dark/10 grid place-items-center">
              <LikeComponent
                impressions={impressions}
                likeIds={likeIds}
                sessionId={sessionId}
                art_id={art_id}
              />
            </div>
          )}
        </div>

        <div className=" bg-transparent pr-3 py-1 w-full">
          <div className="flex flex-col my-2">
            <p className="font-normal text-[14px] text-dark text-ellipsis overflow-hidden whitespace-nowrap">
              {name}
            </p>

            <div className="flex justify-between items-center">
              <p className="font-normal text-[#707070] italic text-[14px] text-ellipsis overflow-hidden whitespace-nowrap">
                {artist}
              </p>
              {/* <HiPencil /> */}
              {isDashboard && (
                <Link href={`/gallery/artworks/edit?id=${name}`}>
                  <button
                    className={`disabled:cursor-not-allowed disabled:text-dark/20 text-[14px] font-normal underline cursor-pointer`}
                  >
                    Edit artwork
                  </button>
                </Link>
              )}
            </div>

            {pricing?.price && pricing.shouldShowPrice === "Yes" ? (
              !availability ? (
                <p className="font-medium text-[14px] text-dark">Sold</p>
              ) : (
                <p className="font-medium text-[14px] text-dark">
                  USD {formatPrice(pricing.usd_price)}
                </p>
              )
            ) : !availability ? (
              <p className="font-medium text-[14px] text-dark">Sold</p>
            ) : (
              <p className="font-medium text-[14px]">Price on request</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// components/ImageGallery.js
