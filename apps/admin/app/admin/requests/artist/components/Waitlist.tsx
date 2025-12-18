"use client";
import { Button } from "@mantine/core";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Mail } from "lucide-react";
import React, { useState, useMemo } from "react";
import { fetchWaitlistUsers } from "@omenai/shared-services/admin/fetch_waitlist_users";
import { inviteWaitlistUsers } from "@omenai/shared-services/admin/invite_waitlist_users";
import { WaitListTypes } from "@omenai/shared-types";
import Load, {
  LoadSmall,
} from "@omenai/shared-ui-components/components/loader/Load";
import NotFoundData from "@omenai/shared-ui-components/components/notFound/NotFoundData";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { toast_notif } from "@omenai/shared-utils/src/toast_notification";
import { InviteArtistModal } from "./InviteArtistModal";

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
      <InviteArtistModal
        opened={modalOpened}
        close={() => setModalOpened(false)}
        SelectedArtists={SelectedArtists}
        onConfirmInvite={inviteArtistUsers}
        isInviting={isInviting}
      />

      {/* Select All Header */}
      <div className="flex items-center justify-between gap-3 px-4">
        <label className="flex items-center gap-2 cursor-pointer group">
          <input
            type="checkbox"
            disabled={filteredArtists.length === 0}
            checked={allSelected}
            ref={(input) => {
              if (input) input.indeterminate = someSelected;
            }}
            onChange={handleSelectAll}
            aria-label={
              allSelected
                ? "Deselect all items"
                : someSelected
                  ? "Select all items (some currently selected)"
                  : "Select all items"
            }
            className="w-5 h-5 rounded border border-black text-slate-900 
    focus:ring-2 focus:ring-slate-500 focus:ring-offset-0 
    cursor-pointer transition-all duration-200
    group-hover:border-slate-400"
          />
          <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
            {allSelected ? "Deselect All" : "Select All"}
          </span>
        </label>
        <div className="flex gap-8 items-center">
          <div>
            <input
              type="text"
              className={
                "w-full bg-transparent border border-slate-300 focus:border-dark outline-none focus:ring-0 rounded-full transition-all duration-300 text-fluid-xxs font-normal text-dark disabled:bg-dark/10 px-4 disabled:bg-gray-50 disabled:border-dark/20 disabled:text-slate-700 disabled:cursor-not-allowed"
              }
              placeholder="Search by name or email"
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button
            disabled={selectedIds.size === 0 || isInviting}
            onClick={openInviteModal}
            variant="gradient"
            gradient={{ from: "#0f172a", to: "#0f172a", deg: 45 }}
            size="xs"
            radius="sm"
            className="
                  font-normal text-fluid-xxs px-4 py-2.5 shadow-lg hover:shadow-xl
                  transition-all duration-300 hover:scale-105 active:scale-95
                  ring-1 ring-blue-200/50 hover:ring-blue-300/70
                  transform-gpu
                "
            styles={{
              root: {
                "&:hover": {
                  transform: "translateY(-2px)",
                },
              },
            }}
          >
            {isInviting ? (
              <LoadSmall />
            ) : (
              `Invite Selected (${selectedIds.size})`
            )}
          </Button>
        </div>
      </div>

      {filteredArtists.map((artist) => {
        const isSelected = selectedIds.has(artist.waitlistId);
        const currentStyle = statusConfig[isSelected ? "selected" : "default"];
        return (
          <div
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
              <div onClick={(e) => e.stopPropagation()}>
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handleSelectItem(artist.waitlistId)}
                  aria-label={`Select ${artist.name}`}
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
          </div>
        );
      })}
      {filteredArtists.length === 0 && <NotFoundData />}
    </div>
  );
}
