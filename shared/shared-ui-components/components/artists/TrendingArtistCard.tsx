import Link from "next/link";
import Image from "next/image";
import React from "react";
import {
  getImageFileView,
  getOptimizedImage,
} from "@omenai/shared-lib/storage/getImageFileView";
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
  const image_href = getOptimizedImage(url, "thumbnail", 40);
  const encoded_url = decodeURIComponent(artist);
  const base_uri = base_url();
  return (
    <div className="group relative mt-8">
      <Link
        href={`${base_uri}/artists/?id=${artist_id}&url=${url}&artist=${artist}`}
        className="block"
      >
        <article className="relative">
          {/* Image with Aspect Ratio */}
          <div className="relative aspect-[4/3] w-[350px] w-full overflow-hidden rounded-md bg-slate-100">
            <Image
              src={image_href}
              alt={artist + " image"}
              height={250}
              width={350}
              loading="lazy"
              quality={100}
              placeholder="blur"
              blurDataURL="data:image/webp;base64,UklGRl4CAABXRUJQVlA4WAoAAAAgAAAA2wAApAAASUNDUMgBAAAAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADZWUDggcAAAAHALAJ0BKtwApQA+bTaZSaQjIqEgSACADYlpbuF2sRtAE9r0VcIMghqqTXbaLhBkENVSa7bRcIMghqqTXbaLhBkENVSa7bRcIMghqqTXbaLhBkENVSa7bRcIMghqqTXbaLhBjkAA/v+8dAAAAAAAAAA="
              className="rounded w-[350px] h-full object-cover object-center cursor-pointer"
            />
          </div>

          {/* Info Below Image */}
          <div className="mt-4 space-y-2">
            <h3 className="text-fluid-xs font-semibold text-slate-900 leading-tight">
              {artist}
            </h3>
            <div className="flex items-center justify-between">
              <p className="text-sm text-dark">
                {country} • Born {birthyear}
              </p>
              <span className="text-sm text-dark">{likes} likes</span>
            </div>
          </div>
        </article>
      </Link>
    </div>
  );
}
