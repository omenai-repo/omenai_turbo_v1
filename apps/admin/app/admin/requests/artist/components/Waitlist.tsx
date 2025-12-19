"use client";
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

const statusConfig = {
  selected: {
    borderColor: "transparent",
    bgColor: "bg-gradient-to-r from-emerald-50/80 to-green-50/60",
    shadowColor: "shadow-emerald-100/50",
    indicatorColor: "green",
    glowColor: "ring-emerald-200/50",
  },
  default: {
    borderColor: "border-dark",
    bgColor: "white",
    shadowColor: "shadow-amber-100/50",
    indicatorColor: "red",
    glowColor: "ring-amber-200/50",
  },
};

export default function Waitlist() {
  const { user, csrf } = useAuth({ requiredRole: "admin" });
  const { data: artists, isLoading: loading } = useQuery<WaitListTypes[]>({
    queryKey: ["fetch_artist_waitlist_users", "artist"],
    queryFn: async () => {
      const response = await fetchWaitlistUsers("artist", csrf || "");

      if (!response.isOk) throw new Error(response.message);
      return response.data;
    },
    refetchOnWindowFocus: false,
    enabled: user.access_role === "Admin" || user.access_role === "Owner",
  });
  const queryClient = useQueryClient();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [isInviting, setIsInviting] = useState(false);
  const [modalOpened, setModalOpened] = useState(false);

  // Prepare selected artist data for modal
  const SelectedArtists = useMemo(() => {
    if (!artists) return [];

    return artists
      .filter((g) => selectedIds.has(g.waitlistId))
      .map((g) => ({
        waitlistId: g.waitlistId,
        name: g.name,
        email: g.email,
        discount: false,
      }));
  }, [artists, selectedIds]);

  if (loading) {
    return <Load />;
  }

  if (!artists || artists.length === 0) {
    return <NotFoundData />;
  }

  const filteredArtists = artists.filter(
    (artist) =>
      artist.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      artist.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectAll = () => {
    if (selectedIds.size === filteredArtists.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredArtists.map((g) => g.waitlistId)));
    }
  };

  const handleSelectItem = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const allSelected =
    selectedIds.size === filteredArtists.length && filteredArtists.length > 0;
  const someSelected =
    selectedIds.size > 0 && selectedIds.size < filteredArtists.length;

  const openInviteModal = () => {
    if (selectedIds.size === 0) return;
    setModalOpened(true);
  };

  async function inviteArtistUsers() {
    if (selectedIds.size === 0) return;

    setIsInviting(true);

    // Build payload with waitlistId
    const invitePayload: { waitlistId: string; discount: boolean }[] =
      Array.from(selectedIds).map((id) => ({
        waitlistId: id,
        discount: false,
      }));

    // API call with simplified payload
    const response = await inviteWaitlistUsers(invitePayload, csrf ?? "");
    if (response.isOk) {
      queryClient.invalidateQueries({
        queryKey: ["fetch_artist_waitlist_users", "artist"],
      });
      setSelectedIds(new Set());
      setModalOpened(false);
      toast_notif(
        `Invitations sent successfully! - ${response.modifiedCount} user invited`,
        "success"
      );
    } else {
      toast_notif(response.message, "error");
    }
    setIsInviting(false);
  }

  return (
    <div className="w-full p-1 flex flex-col gap-6">
      {/* Modal */}
      <InviteEntityModal
        opened={modalOpened}
        close={() => setModalOpened(false)}
        selectedEntity={SelectedArtists}
        onConfirmInvite={inviteArtistUsers}
        isInviting={isInviting}
      />

      {/* Select All Header */}
      <WaitlistHeader
        allSelected={allSelected}
        someSelected={someSelected}
        filteredItemsLength={filteredArtists.length}
        selectedCount={selectedIds.size}
        isInviting={isInviting}
        searchQuery={searchQuery}
        onSelectAll={handleSelectAll}
        onSearchChange={setSearchQuery}
        onInviteClick={openInviteModal}
      />

      {filteredArtists.map((artist) => {
        const isSelected = selectedIds.has(artist.waitlistId);
        const currentStyle = statusConfig[isSelected ? "selected" : "default"];
        return (
          <button
            key={artist.waitlistId}
            onClick={() => handleSelectItem(artist.waitlistId)}
            className={`
          group relative rounded border 2xl:py-3 py-2 ${currentStyle.borderColor} ${currentStyle.bgColor} 
          backdrop-blur-sm transition-all duration-500 ${currentStyle.shadowColor}
          ${currentStyle.glowColor}
          transform-gpu
          hover:shadow-lg cursor-pointer
        `}
          >
            {/* Main content */}
            <div className="relative z-10 grid grid-cols-4 px-4 py-2">
              <div>
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handleSelectItem(artist.waitlistId)}
                  aria-label={`Select ${artist.name}`}
                  onClick={(e) => e.stopPropagation()}
                  className="w-5 h-5 rounded border border-black text-slate-900 
                    focus:ring-2 focus:ring-slate-500 focus:ring-offset-0 
                    cursor-pointer transition-all duration-200
                    hover:border-slate-400"
                />
              </div>

              <div className="flex flex-col justify-self-start">
                <h4 className="text-fluid-xs font-medium text-gray-900 transition-colors duration-300 ">
                  {artist.name}
                </h4>
              </div>
              <div className="flex items-center justify-self-start gap-x-1.5 text-fluid-xxs text-dark">
                <Mail size={18} />
                <span className="font-medium text-fluid-xs">
                  {artist.email}
                </span>
              </div>
            </div>
          </button>
        );
      })}
      {filteredArtists.length === 0 && <NotFoundData />}
    </div>
  );
}
