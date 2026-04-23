"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getGalleryContact } from "@omenai/shared-services/partners/getGalleryContact";
import { AddressTypes } from "@omenai/shared-types";
const fetchGalleryContact = async (galleryId: string) => {
  const res = await getGalleryContact(galleryId);
  if (!res.isOk) throw new Error("Failed to fetch contact info");
  return res.data;
};

export default function GalleryContactPage({
  galleryId,
}: {
  galleryId: string;
}) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["galleryContact", galleryId],
    queryFn: () => fetchGalleryContact(galleryId),
    staleTime: 1000 * 60 * 30, // Can be cached for a long time
  });

  if (isLoading) {
    return (
      <div className="py-32 text-center text-neutral-400 font-sans text-xs uppercase tracking-widest animate-pulse">
        Loading Contact Details...
      </div>
    );
  }

  if (isError || !data) return null;

  const address = data.address || {};

  // Format the address using your exact schema
  const addressLine = address.address_line || "";
  const cityStateZip = [address.city, address.state, address.zip]
    .filter(Boolean)
    .join(", ");

  // Create a clean array of address parts, filter out empties, and encode for the URL
  const queryParts = [
    data.name,
    addressLine,
    cityStateZip,
    address.country,
  ].filter(Boolean);
  const mapQueryString = encodeURIComponent(queryParts.join(", "));

  return (
    <div className="w-full py-8 max-w-[1600px] mx-auto p-4 md:p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24 lg:gap-32 items-start">
        {/* LEFT COLUMN: THE INFO */}
        <div className="flex flex-col pt-8">
          <h2 className="font-serif text-2xl md:text-3xl text-dark mb-12">
            Gallery Location
          </h2>

          <div className="flex flex-col space-y-8">
            <div>
              <h3 className="font-sans text-[10px] uppercase tracking-[0.2em] text-neutral-400 font-medium mb-4">
                Gallery Address
              </h3>
              <div className="font-sans text-sm text-dark font-medium leading-relaxed uppercase tracking-wide">
                <p className="font-semibold">{data.name}</p>
                {addressLine && (
                  <p className="text-neutral-500">{addressLine}</p>
                )}
                {cityStateZip && (
                  <p className="text-neutral-500">{cityStateZip}</p>
                )}
                {address.country && (
                  <p className="text-neutral-500">{address.country}</p>
                )}
              </div>
            </div>

            {/* <div>
              <h3 className="font-sans text-[10px] uppercase tracking-[0.2em] text-neutral-400 font-medium mb-4">
                Visiting Hours
              </h3>
              <div className="font-sans text-sm text-neutral-500 leading-relaxed uppercase tracking-wide space-y-1">
                <p>Tuesday — Saturday</p>
                <p>11:00 AM — 6:00 PM</p>
                <p>Closed Sunday & Monday</p>
              </div>
            </div> */}

            <div className="pt-8 mt-8 border-t border-neutral-100">
              <p className="font-sans text-xs text-neutral-400 leading-relaxed max-w-sm">
                To inquire about purchasing artworks, please navigate to the
                specific artwork page and select "Request Price". All
                transactions are securely managed through Omenai.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: THE MAP */}
        {/* RIGHT COLUMN: THE MAP */}
        <div className="w-full aspect-square md:aspect-auto md:h-[600px] bg-neutral-100 border border-neutral-200 p-2 rounded-sm relative overflow-hidden">
          {queryParts.length > 1 ? (
            <iframe
              title={`${data.name} Location`}
              className="w-full h-full object-cover grayscale-[100%] contrast-[110%] opacity-90 transition-all duration-700 hover:grayscale-[50%] hover:opacity-100"
              src={`https://maps.google.com/maps?q=${mapQueryString}&t=m&z=15&output=embed`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-neutral-50">
              <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-neutral-400">
                Map Unavailable
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
