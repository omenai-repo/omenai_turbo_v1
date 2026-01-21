"use client";
import { getOptimizedImage } from "@omenai/shared-lib/storage/getImageFileView";
import Image from "next/image";
import { useState } from "react";
import { FaInstagram, FaTwitter, FaLinkedin, FaGithub } from "react-icons/fa";
import { HiCheckBadge } from "react-icons/hi2";

export default function ArtistInfo({
  loading,
  info,
  url,
}: {
  loading: boolean;
  info: any;
  url: string;
}) {
  const image_href = getOptimizedImage(url, "medium");
  const [imageLoaded, setImageLoaded] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const isTruncated = info.bio.length > 400;
  const displayText =
    expanded || !isTruncated ? info.bio : info.bio.slice(0, 400) + "...";
  const toggleExpanded = () => setExpanded((prev) => !prev);
  const socials = info.documentation?.socials || {};
  console.log(info);

  return (
    <div className="w-full">
      {/* 1. HEADER (Name & Meta) */}
      <div className="mb-12">
        <h1 className="font-serif text-2xl md:text-3xl lg:text-5xl text-dark  leading-[0.9] tracking-tight mb-6">
          {info.name}
        </h1>

        <div className="flex flex-wrap items-center gap-4 md:gap-8 font-sans text-xs font-bold uppercase tracking-wider text-neutral-500">
          {info.dob && (
            <div className="flex items-center gap-2">
              <span className="text-neutral-300">Born</span>
              <span className="text-dark ">{info.dob}</span>
            </div>
          )}

          <div className="h-4 w-[1px] bg-neutral-200" />

          <div className="flex items-center gap-2 font-normal">
            <span className="text-neutral-500">Based in</span>
            <span className="text-dark ">{info.address.country}</span>
          </div>

          <div className="h-4 w-[1px] bg-neutral-200" />

          <div className="flex items-center gap-1.5 text-dark font-normal">
            <HiCheckBadge className="text-lg text-blue-600" />
            <span>Verified Artist</span>
          </div>
        </div>
      </div>

      {/* 2. SPLIT LAYOUT */}
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
        {/* LEFT: Portrait (Sticky) */}
        <div className="lg:col-span-4 xl:col-span-3">
          <div className="relative aspect-[3/4] w-full overflow-hidden rounded-sm bg-neutral-100 shadow-sm lg:sticky lg:top-32">
            <Image
              fill
              src={image_href}
              alt={`${info.name} portrait`}
              onLoad={() => setImageLoaded(true)}
              className={`
                object-cover transition-all duration-1000
                ${imageLoaded ? "opacity-100 scale-100" : "opacity-0 scale-105"}
                
              `}
            />
          </div>
        </div>

        {/* RIGHT: Bio & Connect */}
        <div className="lg:col-span-8 xl:col-span-9 flex flex-col gap-12 lg:pl-12">
          {/* Biography */}
          <div>
            <span className="font-sans text-xs font-bold uppercase tracking-widest text-neutral-400 block mb-6">
              Biography
            </span>
            <div className="prose prose-neutral max-w-none prose-p:font-serif prose-p:text-sm md:prose-p:text-md prose-p:leading-relaxed prose-p:text-neutral-700">
              <p className="whitespace-pre-wrap">{displayText}</p>
            </div>

            {isTruncated && (
              <button
                onClick={toggleExpanded}
                className="mt-6 group flex items-center gap-3 font-sans text-xs font-bold uppercase tracking-widest text-dark  hover:text-neutral-500 transition-colors"
              >
                {expanded ? "Read Less" : "Read Full Bio"}
                <span
                  className={`h-[1px] bg-[#091830] transition-all duration-300 ${expanded ? "w-4" : "w-12"}`}
                />
              </button>
            )}
          </div>

          {/* Socials */}
          {/* <div>
            <span className="font-sans text-xs font-bold uppercase tracking-widest text-neutral-400 block mb-6">
              Connect
            </span>
            <div className="flex gap-4">
              {[
                { icon: FaInstagram, link: socials.instagram },
                { icon: FaTwitter, link: socials.twitter },
                { icon: FaLinkedin, link: socials.linkedin },
                { icon: FaGithub, link: socials.github },
              ].map((item, i) =>
                item.link ? (
                  <a
                    key={i}
                    href={item.link}
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-50 text-neutral-500 hover:bg-[#091830] hover:text-white transition-all duration-300"
                  >
                    <item.icon size={18} />
                  </a>
                ) : null,
              )}
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
}
