import Link from "next/link";
import Image from "next/image";
import React from "react";
import { getImageFileView } from "@omenai/shared-lib/storage/getImageFileView";
import { base_url } from "@omenai/url-config/src/config";

export function TrendingArtistCard({
  url,
  artist,
  likes,
  birthyear,
  country,
  artist_id,
}: {
  url: string;
  artist: string;
  likes: string;
  birthyear: string;
  country: string;
  artist_id: string;
}) {
  const image_href = getImageFileView(url, 300);
  const encoded_url = decodeURIComponent(artist);
  const base_uri = base_url();
  return (
    <div>
      <Link
        href={`${base_uri}/artist/?id=${artist_id}&url=${url}&artist=${artist}`}
        className="relative block min-w-[280px] w-[350px]"
      >
        {/* Reserved space for the image using aspect ratio */}
        <div className="w-full h-[250px]">
          <Image
            src={image_href}
            alt={artist + " image"}
            height={250}
            width={350}
            loading="lazy"
            quality={100}
            placeholder="blur"
            blurDataURL="data:image/webp;base64,UklGRl4CAABXRUJQVlA4WAoAAAAgAAAA2wAApAAASUNDUMgBAAAAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADZWUDggcAAAAHALAJ0BKtwApQA+bTaZSaQjIqEgSACADYlpbuF2sRtAE9r0VcIMghqqTXbaLhBkENVSa7bRcIMghqqTXbaLhBkENVSa7bRcIMghqqTXbaLhBkENVSa7bRcIMghqqTXbaLhBjkAA/v+8dAAAAAAAAAA="
            className="rounded w-full h-full object-cover object-center cursor-pointer"
          />
        </div>
      </Link>
      <div className="flex justify-between items-center my-3">
        <div className="flex flex-col">
          <p className="text-fluid-xs font-medium">{artist}</p>
          <div className="flex gap-x-1 items-center">
            <p className="text-fluid-xxs">{country}</p>{" "}
            <span className="text-fluid-xxs">b.</span>
            {""}
            <p className="text-fluid-xxs">{birthyear}</p>
          </div>
        </div>
        <div>
          <button className="text-fluid-xxs border-0 ring-dark ring-1 px-6 py-2 rounded-full cursor-default">
            {likes} likes
          </button>
        </div>
      </div>
    </div>
  );
}
