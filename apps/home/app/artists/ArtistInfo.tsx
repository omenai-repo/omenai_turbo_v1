"use client";
import { getOptimizedImage } from "@omenai/shared-lib/storage/getImageFileView";
import Image from "next/image";
import { useState } from "react";
import { FaInstagram, FaTwitter, FaLinkedin, FaGithub } from "react-icons/fa";

export default function ArtistInfo({
  loading,
  info,
  url,
}: {
  loading: boolean;
  info: any;
  url: string;
}) {
  const image_href = getOptimizedImage(url, "medium"); // Higher res for the "Portrait" look
  const [imageLoaded, setImageLoaded] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const isTruncated = info.bio.length > 400;
  const displayText =
    expanded || !isTruncated ? info.bio : info.bio.slice(0, 400) + "...";
  const toggleExpanded = () => setExpanded((prev) => !prev);
  const socials = info.documentation.socials;

  return (
    <div className="w-full">
      {/* 1. THE TITLE BLOCK */}
      <div className="mb-12 border-b border-black pb-8">
        <h1 className="font-serif text-6xl md:text-8xl italic leading-[0.9] text-dark">
          {info.name}
        </h1>
        <div className="mt-6 flex flex-wrap gap-6 font-mono text-[10px] uppercase tracking-widest text-neutral-500">
          <span>Est. {info.dob || "N/A"}</span>
          <span className="h-3 w-[1px] bg-neutral-300"></span>
          <span>{info.country}</span>
          <span className="h-3 w-[1px] bg-neutral-300"></span>
          <span>Verified Artist</span>
        </div>
      </div>

      {/* 2. THE BIOGRAPHY SPLIT */}
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
        {/* Left: The Portrait (Sticky) */}
        <div className="lg:col-span-5">
          <div className="relative aspect-[3/4] w-full overflow-hidden bg-neutral-100 lg:sticky lg:top-32">
            <Image
              fill
              src={image_href}
              alt={`${info.name} portrait`}
              onLoad={() => setImageLoaded(true)}
              className={`object-cover transition-opacity duration-700 ${
                imageLoaded ? "opacity-100" : "opacity-0"
              } grayscale hover:grayscale-0 transition-all duration-1000`}
            />
          </div>
        </div>

        {/* Right: The Text */}
        <div className="flex flex-col justify-between lg:col-span-7 lg:pl-12">
          <div className="space-y-8">
            <h2 className="font-mono text-xs uppercase tracking-widest text-neutral-400">
              Biography
            </h2>
            <div className="prose prose-neutral max-w-none">
              <p className="whitespace-pre-wrap font-serif text-lg leading-relaxed text-neutral-800 md:text-xl">
                {displayText}
              </p>
            </div>

            {isTruncated && (
              <button
                onClick={toggleExpanded}
                className="group flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-dark"
              >
                {expanded ? "Collapse" : "Read Full Bio"}
                <span
                  className={`h-[1px] w-8 bg-dark transition-all duration-300 ${expanded ? "w-4" : "w-12"}`}
                ></span>
              </button>
            )}
          </div>

          {/* Social Index */}
          <div className="mt-12 pt-8 border-t border-neutral-100">
            <span className="mb-4 block font-mono text-[9px] uppercase tracking-widest text-neutral-400">
              Connect
            </span>
            <div className="flex gap-6">
              {socials.instagram && (
                <a
                  href={socials.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="text-neutral-400 hover:text-dark transition-colors"
                >
                  <FaInstagram size={20} />
                </a>
              )}
              {socials.twitter && (
                <a
                  href={socials.twitter}
                  target="_blank"
                  rel="noreferrer"
                  className="text-neutral-400 hover:text-dark transition-colors"
                >
                  <FaTwitter size={20} />
                </a>
              )}
              {socials.linkedin && (
                <a
                  href={socials.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="text-neutral-400 hover:text-dark transition-colors"
                >
                  <FaLinkedin size={20} />
                </a>
              )}
              {socials.github && (
                <a
                  href={socials.github}
                  target="_blank"
                  rel="noreferrer"
                  className="text-neutral-400 hover:text-dark transition-colors"
                >
                  <FaGithub size={20} />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
