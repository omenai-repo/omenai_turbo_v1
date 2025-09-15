"use client";
/* eslint-disable @next/next/no-img-element */

import Link from "next/link";

import {
  getImageFileView,
  getOptimizedImage,
} from "@omenai/shared-lib/storage/getImageFileView";
import Image from "next/image";

export default function RecentViewedCard({
  image,
  artist,
  name,
}: {
  image: string;
  artist: string;
  name: string;
}) {
  const image_href = getOptimizedImage(image, "thumbnail");
  return (
    <div className="my-2 max-w-full p-0 max-h-full min-w-[300px] w-[400px] rounded">
      <div className="flex flex-col w-full h-full justify-end">
        <div className="relative w-full artContainer">
          <Link href={`/artwork/${name}`} className="relative">
            <Image
              src={image_href}
              alt={name + " image"}
              loading="lazy"
              height={400}
              width={400}
              className="w-full rounded h-full aspect-auto object-cover object-center cursor-pointer artImage"
            />
          </Link>

          <div className="flex items-center justify-center">
            {/* Glass Card */}
            <div className="p-3 rounded bg-dark/40 backdrop-blur-sm shadow-lg absolute bottom-[20px] left-[20px] right-[20px]">
              {/* Title */}
              <h3 className="font-normal  text-white text-fluid-xs leading-tight line-clamp-2">
                {name}
              </h3>
              <p className="text-white  text-fluid-xs">
                {artist.length > 25 ? `${artist.substring(0, 25)}...` : artist}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// components/ImageGallery.js
