"use client";
function ArtistWaitlistRow({
  artist,
  isSelected,
  onSelect,
}: {
  artist: WaitListTypes;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <div
      className={`
        relative flex items-center gap-4 px-4 py-3
        transition
        ${isSelected ? "bg-emerald-50/60" : "hover:bg-neutral-50"}
      `}
    >
      {isSelected && (
        <div className="absolute left-0 top-0 h-full w-1 bg-emerald-500" />
      )}

      <input
        type="checkbox"
        checked={isSelected}
        onChange={onSelect}
        onClick={(e) => e.stopPropagation()}
        className="h-4 w-4 rounded border-neutral-300"
      />

      <div className="flex flex-col min-w-0">
        <span className="text-sm font-medium text-neutral-900 truncate">
          {artist.name}
        </span>
        <span className="flex items-center gap-1.5 text-xs text-neutral-500 truncate">
          <Mail size={13} />
          {artist.email}
        </span>
      </div>
    </div>
  );
}

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Mail } from "lucide-react";
import React, { useState, useMemo } from "react";

import { fetchWaitlistUsers } from "@omenai/shared-services/admin/fetch_waitlist_users";
import { inviteWaitlistUsers } from "@omenai/shared-services/admin/invite_waitlist_users";
import { WaitListTypes } from "@omenai/shared-types";

import Load from "@omenai/shared-ui-components/components/loader/Load";
import NotFoundData from "@omenai/shared-ui-components/components/notFound/NotFoundData";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { toast_notif } from "@omenai/shared-utils/src/toast_notification";

import { InviteEntityModal } from "../../InviteEntityModal";
import { WaitlistHeader } from "../../WaitlistHeader";

export default function ArtistWaitlist() {
  const { user, csrf } = useAuth({ requiredRole: "admin" });
  const queryClient = useQueryClient();

  const { data: artists, isLoading } = useQuery<WaitListTypes[]>({
    queryKey: ["fetch_artist_waitlist_users", "artist"],
    queryFn: async () => {
      const response = await fetchWaitlistUsers("artist", csrf || "");
      if (!response.isOk) throw new Error(response.message);
      return response.data;
    },
    enabled: user.access_role === "Admin" || user.access_role === "Owner",
    refetchOnWindowFocus: false,
  });

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [isInviting, setIsInviting] = useState(false);
  const [modalOpened, setModalOpened] = useState(false);

  const selectedArtists = useMemo(() => {
    if (!artists) return [];
    return artists
      .filter((a) => selectedIds.has(a.waitlistId))
      .map((a) => ({
        waitlistId: a.waitlistId,
        name: a.name,
        email: a.email,
        discount: false,
      }));
  }, [artists, selectedIds]);

  if (isLoading) return <Load />;
  if (!artists || artists.length === 0) return <NotFoundData />;

  const filteredArtists = artists.filter(
    (a) =>
      a.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectAll = () => {
    setSelectedIds(
      selectedIds.size === filteredArtists.length
        ? new Set()
        : new Set(filteredArtists.map((a) => a.waitlistId))
    );
  };

  const handleSelectItem = (id: string) => {
    const next = new Set(selectedIds);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelectedIds(next);
  };

  const allSelected =
    selectedIds.size === filteredArtists.length && filteredArtists.length > 0;

  const someSelected =
    selectedIds.size > 0 && selectedIds.size < filteredArtists.length;

  async function inviteArtistUsers() {
    if (selectedIds.size === 0) return;
    setIsInviting(true);

    const payload = Array.from(selectedIds).map((id) => ({
      waitlistId: id,
      discount: false,
    }));

    const response = await inviteWaitlistUsers(payload, csrf ?? "");
    if (response.isOk) {
      queryClient.invalidateQueries({
        queryKey: ["fetch_artist_waitlist_users", "artist"],
      });
      setSelectedIds(new Set());
      setModalOpened(false);
      toast_notif(
        `Invitations sent — ${response.modifiedCount} invited`,
        "success"
      );
    } else {
      toast_notif(response.message, "error");
    }

    setIsInviting(false);
  }

  return (
    <section className="space-y-4">
      <InviteEntityModal
        opened={modalOpened}
        close={() => setModalOpened(false)}
        selectedEntity={selectedArtists}
        onConfirmInvite={inviteArtistUsers}
        isInviting={isInviting}
      />

      <div className="rounded-xl border border-neutral-200 bg-white shadow-sm">
        <div className="border-b border-neutral-100 px-4 py-3">
          <WaitlistHeader
            allSelected={allSelected}
            someSelected={someSelected}
            filteredItemsLength={filteredArtists.length}
            selectedCount={selectedIds.size}
            isInviting={isInviting}
            searchQuery={searchQuery}
            onSelectAll={handleSelectAll}
            onSearchChange={setSearchQuery}
            onInviteClick={() => setModalOpened(true)}
          />
        </div>

        <div className="divide-y divide-neutral-100">
          {filteredArtists.map((artist) => (
            <ArtistWaitlistRow
              key={artist.waitlistId}
              artist={artist}
              isSelected={selectedIds.has(artist.waitlistId)}
              onSelect={() => handleSelectItem(artist.waitlistId)}
            />
          ))}
        </div>

        {filteredArtists.length === 0 && (
          <div className="p-6">
            <NotFoundData />
          </div>
        )}
      </div>
    </section>
  );
}
