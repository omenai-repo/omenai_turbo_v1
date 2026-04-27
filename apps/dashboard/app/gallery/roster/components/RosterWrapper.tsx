"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { RosterArtistCard } from "./RosterArtistCard";
import { RosterArtist } from "@omenai/shared-types";
import { AddArtistModal } from "./AddArtist";
import { RemoveSuccessModal } from "./RemoveSuccessModal";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { fetchRoster } from "@omenai/shared-services/gallery/roster/fetchRoster";
import { removeArtistFromRoster } from "@omenai/shared-services/gallery/roster/removeArtistFromRoster";
import { ConfirmRemoveModal } from "./ConfirmRemovalModal";
import { INPUT_CLASS } from "@omenai/shared-ui-components/components/styles/inputClasses";

export const GalleryRosterDashboard = () => {
  const { user, csrf } = useAuth({ requiredRole: "gallery" });
  const galleryId = user.gallery_id;
  const [roster, setRoster] = useState<RosterArtist[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Removal Flow States
  const [artistToConfirmRemove, setArtistToConfirmRemove] =
    useState<RosterArtist | null>(null);
  const [removedArtist, setRemovedArtist] = useState<RosterArtist | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");

  const fetchRosterData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetchRoster(galleryId, csrf || "");
      if (res.isOk) {
        setRoster(res.roster);
      }
    } catch (error) {
      console.error("Failed to fetch roster", error);
    } finally {
      setIsLoading(false);
    }
  }, [galleryId, csrf]);

  useEffect(() => {
    fetchRosterData();
  }, [fetchRosterData]);

  // 1. Intercept the card click (Opens Confirmation)
  const handleInitiateRemove = (artistId: string) => {
    const targetArtist = roster.find((a) => a.artist_id === artistId);
    if (targetArtist) {
      setArtistToConfirmRemove(targetArtist);
    }
  };

  // 2. The actual API call (Fired from the Confirmation Modal)
  const handleConfirmRemove = async (artistId: string) => {
    setIsRemoving(true);

    try {
      const res = await removeArtistFromRoster(galleryId, artistId, csrf || "");

      if (res.isOk) {
        // Update Grid
        setRoster((prev) => prev.filter((a) => a.artist_id !== artistId));

        // Pass data to success modal & close confirmation modal
        setRemovedArtist(artistToConfirmRemove);
        setArtistToConfirmRemove(null);
      }
    } catch (error) {
      console.error("Failed to remove artist", error);
    } finally {
      setIsRemoving(false);
    }
  };

  const filteredRoster = useMemo(() => {
    if (!searchTerm.trim()) return roster;
    return roster.filter((artist) =>
      artist.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [roster, searchTerm]);

  return (
    <div className="w-full max-w-full mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-6">
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-2xl font-normal tracking-tight text-dark">
              Represented Artists
            </h1>
            <p className="text-sm text-neutral-500 mt-2 tracking-wide">
              Manage the artists actively represented by your gallery on Omenai.
            </p>
          </div>

          <input
            type="text"
            placeholder="Search roster..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={INPUT_CLASS}
          />
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-dark text-white px-6 py-3 text-xs font-medium tracking-widest uppercase hover:bg-neutral-800 transition-colors duration-300 rounded-sm  shrink-0"
        >
          + Add Artist
        </button>
      </div>

      {isLoading ? (
        <div className="w-full py-20 flex justify-center text-sm text-neutral-400 tracking-widest uppercase">
          Loading roster...
        </div>
      ) : roster.length === 0 ? (
        <div className="w-full py-32 flex flex-col items-center justify-center border border-dashed border-neutral-200 bg-neutral-50/50 rounded-sm  ">
          <p className="text-neutral-500 text-sm mb-4">
            Your roster is currently empty.
          </p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="text-xs tracking-widest uppercase border-b border-dark text-dark pb-0.5"
          >
            Add your first artist
          </button>
        </div>
      ) : filteredRoster.length === 0 ? (
        <div className="w-full py-20 flex flex-col items-center justify-center border border-neutral-100 bg-white rounded-sm  ">
          <p className="text-neutral-500 text-sm">
            No artists found matching "{searchTerm}"
          </p>
          <button
            onClick={() => setSearchTerm("")}
            className="mt-4 text-xs tracking-widest uppercase border-b border-dark text-dark pb-0.5"
          >
            Clear Search
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredRoster.map((artist) => (
            <RosterArtistCard
              key={artist.artist_id}
              artist={artist}
              isRemoving={
                isRemoving &&
                artistToConfirmRemove?.artist_id === artist.artist_id
              }
              onRemove={handleInitiateRemove} // <-- Point this to the interception function
            />
          ))}
        </div>
      )}

      {/* Roster Modals */}
      <AddArtistModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        galleryId={galleryId}
        onSuccess={fetchRosterData}
      />

      <ConfirmRemoveModal
        isOpen={!!artistToConfirmRemove}
        artist={artistToConfirmRemove}
        isRemoving={isRemoving}
        onClose={() => setArtistToConfirmRemove(null)}
        onConfirm={handleConfirmRemove}
      />

      <RemoveSuccessModal
        artist={removedArtist}
        onClose={() => setRemovedArtist(null)}
      />
    </div>
  );
};
