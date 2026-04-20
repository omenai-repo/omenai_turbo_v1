// components/shared/ArtistAutocomplete.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { fetchArtistsData } from "@omenai/shared-services/gallery/fetchArtists";
import { INPUT_CLASS } from "@omenai/shared-ui-components/components/styles/inputClasses";
import { getGalleryLogoFileView } from "@omenai/shared-lib/storage/getGalleryLogoFileView";

export type ArtistSearchResult = {
  artist_id: string;
  name: string;
  profile_status: "claimed" | "ghost";
  artist_verified: boolean;
  logo: string | null;
  birthyear?: string;
  country_of_origin?: string;
  location?: string;
  represented_by?: string;
};

// The exact shape of the artist data from your store

export interface SelectedArtistState {
  name: string;
  artist_id: string;
  newGhostArtistName: string;
  birthyear: string;
  country_of_origin: string;
}

// ... inside the component, ensure you reference value.name, value.birthyear, etc.

interface ArtistAutocompleteProps {
  value: SelectedArtistState;
  onChange: (newState: SelectedArtistState) => void;
}

export const ArtistAutocomplete = ({
  value,
  onChange,
}: ArtistAutocompleteProps) => {
  const [query, setQuery] = useState(value.name || "");
  const [results, setResults] = useState<ArtistSearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { csrf } = useAuth({ requiredRole: "gallery" });

  const wrapperRef = useRef<HTMLDivElement>(null);
  const valueRef = useRef(value);
  const queryRef = useRef(query);

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  useEffect(() => {
    queryRef.current = query;
  }, [query]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        const latestValue = valueRef.current;
        const latestQuery = queryRef.current;

        if (latestQuery.trim() !== "" && !latestValue.artist_id) {
          onChange({
            ...latestValue,
            name: latestQuery,
            newGhostArtistName: latestQuery,
            artist_id: "",
          });
        }

        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onChange]);

  useEffect(() => {
    const fetchArtists = async () => {
      if (query.trim().length < 2) {
        setResults([]);
        return;
      }
      setIsLoading(true);
      try {
        const data = await fetchArtistsData(query, csrf || "");
        setResults(data.results || []);
      } catch (error) {
        console.error("Failed to fetch artists", error);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      if (query !== value.name) {
        fetchArtists();
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [query, value.name, csrf]);

  const handleSelectArtist = (selected: ArtistSearchResult) => {
    setQuery(selected.name);
    onChange({
      ...value,
      name: selected.name,
      newGhostArtistName: "",
      artist_id: selected.artist_id,
      birthyear: selected.birthyear || "",
      country_of_origin: selected.country_of_origin || "",
    });
    setIsOpen(false);
  };

  const handleCreateNew = () => {
    onChange({
      ...value,
      name: query,
      newGhostArtistName: query,
      artist_id: "",
      birthyear: "",
      country_of_origin: "",
    });
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <label className="block text-xs font-normal text-dark mb-2">
        Artist Name
      </label>

      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        placeholder="Search or enter artist name..."
        className={INPUT_CLASS}
      />

      {isOpen && query.trim().length >= 2 && (
        <div className="absolute top-full left-0 w-full mt-1 bg-white border border-neutral-100 shadow-[0_8px_30px_rgb(0,0,0,0.08)] max-h-72 overflow-y-auto z-50 rounded ">
          {isLoading ? (
            <div className="p-4 text-xs tracking-wide text-neutral-500">
              Searching...
            </div>
          ) : (
            <div className="flex flex-col">
              {results.map((res) => (
                <div
                  key={res.artist_id}
                  onClick={() => handleSelectArtist(res)}
                  className="flex items-center gap-3 p-3 cursor-pointer hover:bg-neutral-50 transition-colors border-b border-neutral-50 last:border-0"
                >
                  <div className="h-8 w-8 shrink-0 rounded-full bg-neutral-100 overflow-hidden flex items-center justify-center">
                    {res.logo ? (
                      <Image
                        src={getGalleryLogoFileView(res.logo, 200)}
                        alt={res.name}
                        width={32}
                        height={32}
                        className="object-cover"
                      />
                    ) : (
                      <span className="text-[10px] font-medium tracking-wider text-neutral-500">
                        {res.name.substring(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-medium text-neutral-900">
                        {res.name}
                      </span>
                      {res.artist_verified && (
                        <svg
                          className="w-3.5 h-3.5 text-blue-600"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                        </svg>
                      )}
                    </div>
                    <span className="text-[11px] tracking-wide text-neutral-500">
                      {res.profile_status === "claimed"
                        ? `Claimed Profile • ${res.location || "Unknown Location"}`
                        : `Unclaimed Profile • ${res.represented_by ? `Represented by ${res.represented_by}` : "Unrepresented"}`}
                    </span>
                  </div>
                </div>
              ))}

              <div
                onClick={handleCreateNew}
                className="p-3 cursor-pointer hover:bg-neutral-50 transition-colors flex items-center gap-2 text-sm font-medium text-neutral-900 border-t border-neutral-100"
              >
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-neutral-900 text-white text-xs">
                  +
                </span>
                Create new artist: &quot;{query}&quot;
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
