"use client";
import { getImageFileView } from "@omenai/shared-lib/storage/getImageFileView";
import Image from "next/image";
import { useState } from "react";

export default function ArtistInfo({
  loading,
  info,
  url,
}: {
  loading: boolean;
  info: any;
  url: string;
}) {
  const image_href = getImageFileView(url, 300);

  const [expanded, setExpanded] = useState(false);

  const isTruncated = info.bio.length > 300;
  const displayText =
    expanded || !isTruncated ? info.bio : info.bio.slice(0, 300) + "...";

  const toggleExpanded = () => setExpanded((prev) => !prev);
  return (
    <div className="flex flex-col space-y-4 p-4">
      <div className="w-[300px] h-[300px]">
        <Image
          src={image_href}
          alt={url + " image"}
          height={300}
          width={300}
          loading="lazy"
          quality={100}
          placeholder="blur"
          blurDataURL="data:image/webp;base64,UklGRl4CAABXRUJQVlA4WAoAAAAgAAAA2wAApAAASUNDUMgBAAAAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADZWUDggcAAAAHALAJ0BKtwApQA+bTaZSaQjIqEgSACADYlpbuF2sRtAE9r0VcIMghqqTXbaLhBkENVSa7bRcIMghqqTXbaLhBkENVSa7bRcIMghqqTXbaLhBkENVSa7bRcIMghqqTXbaLhBjkAA/v+8dAAAAAAAAAA="
          className="w-full h-full object-cover object-center cursor-pointer rounded"
        />
      </div>
      <div className="md:max-w-[50%] max-w-full flex flex-col space-y-3">
        <h1 className="text-fluid-2xl font-medium">{info.name}</h1>
        <p className="font-normal leading-7">
          {displayText}{" "}
          {isTruncated && (
            <button
              onClick={toggleExpanded}
              className="ml-1 text-dark underline font-normal hover:underline focus:outline-none tracking-wider"
            >
              {expanded ? "Read less" : "Read more"}
            </button>
          )}
        </p>
      </div>
    </div>
  );
}
