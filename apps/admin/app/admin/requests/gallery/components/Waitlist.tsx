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

export default function Waitlist() {
  const { user, csrf } = useAuth({ requiredRole: "admin" });
  const queryClient = useQueryClient();

  const { data: galleries, isLoading } = useQuery<WaitListTypes[]>({
    queryKey: ["fetch_gallery_waitlist_users", "gallery"],
    queryFn: async () => {
      const response = await fetchWaitlistUsers("gallery", csrf || "");
      if (!response.isOk) throw new Error(response.message);
      return response.data;
    },
    enabled: user.access_role === "Admin" || user.access_role === "Owner",
    refetchOnWindowFocus: false,
  });

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [discountToggles, setDiscountToggles] = useState<Map<string, boolean>>(
    new Map()
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isInviting, setIsInviting] = useState(false);
  const [modalOpened, setModalOpened] = useState(false);

  const selectedGalleries = useMemo(() => {
    if (!galleries) return [];
    return galleries
      .filter((g) => selectedIds.has(g.waitlistId))
      .map((g) => ({
        waitlistId: g.waitlistId,
        name: g.name,
        email: g.email,
        discount: discountToggles.get(g.waitlistId) || false,
      }));
  }, [galleries, selectedIds, discountToggles]);

  if (isLoading) return <Load />;
  if (!galleries || galleries.length === 0) return <NotFoundData />;

  const filteredGalleries = galleries.filter(
    (g) =>
      g.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectAll = () => {
    setSelectedIds(
      selectedIds.size === filteredGalleries.length
        ? new Set()
        : new Set(filteredGalleries.map((g) => g.waitlistId))
    );
  };

  const handleSelectItem = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
      const discounts = new Map(discountToggles);
      discounts.delete(id);
      setDiscountToggles(discounts);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const handleToggleDiscount = (id: string, checked: boolean) => {
    setDiscountToggles(new Map(discountToggles.set(id, checked)));
    if (checked && !selectedIds.has(id)) {
      setSelectedIds(new Set(selectedIds).add(id));
    }
  };

  const allSelected =
    selectedIds.size === filteredGalleries.length &&
    filteredGalleries.length > 0;
  const someSelected =
    selectedIds.size > 0 && selectedIds.size < filteredGalleries.length;

  async function inviteGalleryUsers() {
    if (selectedIds.size === 0) return;
    setIsInviting(true);

    const payload = Array.from(selectedIds).map((id) => ({
      waitlistId: id,
      discount: discountToggles.get(id) || false,
    }));

    const response = await inviteWaitlistUsers(payload, csrf ?? "");
    if (response.isOk) {
      queryClient.invalidateQueries({
        queryKey: ["fetch_gallery_waitlist_users", "gallery"],
      });
      setSelectedIds(new Set());
      setDiscountToggles(new Map());
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
        selectedEntity={selectedGalleries}
        onConfirmInvite={inviteGalleryUsers}
        isInviting={isInviting}
      />

      <div className="rounded-xl border border-neutral-200 bg-white shadow-sm">
        <div className="border-b border-neutral-100 px-4 py-3">
          <WaitlistHeader
            allSelected={allSelected}
            someSelected={someSelected}
            filteredItemsLength={filteredGalleries.length}
            selectedCount={selectedIds.size}
            isInviting={isInviting}
            searchQuery={searchQuery}
            onSelectAll={handleSelectAll}
            onSearchChange={setSearchQuery}
            onInviteClick={() => setModalOpened(true)}
          />
        </div>

        <div className="divide-y divide-neutral-100">
          {filteredGalleries.map((gallery) => (
            <WaitlistRow
              key={gallery.waitlistId}
              gallery={gallery}
              isSelected={selectedIds.has(gallery.waitlistId)}
              hasDiscount={discountToggles.get(gallery.waitlistId) || false}
              onSelect={() => handleSelectItem(gallery.waitlistId)}
              onToggleDiscount={(checked) =>
                handleToggleDiscount(gallery.waitlistId, checked)
              }
            />
          ))}
        </div>

        {filteredGalleries.length === 0 && (
          <div className="p-6">
            <NotFoundData />
          </div>
        )}
      </div>
    </section>
  );
}

function WaitlistRow({
  gallery,
  isSelected,
  hasDiscount,
  onSelect,
  onToggleDiscount,
}: {
  gallery: WaitListTypes;
  isSelected: boolean;
  hasDiscount: boolean;
  onSelect: () => void;
  onToggleDiscount: (checked: boolean) => void;
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
        className="h-4 w-4 rounded border-neutral-300"
      />

      <div className="flex flex-col min-w-0 flex-1">
        <span className="text-sm font-medium text-neutral-900 truncate">
          {gallery.name}
        </span>
        <span className="flex items-center gap-1.5 text-xs text-neutral-500 truncate">
          <Mail size={13} />
          {gallery.email}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-xs text-neutral-600">Discount</span>
        <label className="relative inline-flex h-5 w-9 cursor-pointer items-center">
          <input
            type="checkbox"
            checked={hasDiscount}
            onChange={(e) => onToggleDiscount(e.target.checked)}
            className="peer sr-only"
          />
          <span className="absolute inset-0 rounded-full bg-neutral-300 transition peer-checked:bg-neutral-900" />
          <span className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white transition peer-checked:translate-x-4" />
        </label>
      </div>
    </div>
  );
}
