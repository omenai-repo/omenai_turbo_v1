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
  const { data: galleries, isLoading: loading } = useQuery<WaitListTypes[]>({
    queryKey: ["fetch_gallery_waitlist_users", "gallery"],
    queryFn: async () => {
      const response = await fetchWaitlistUsers("gallery", csrf || "");

      if (!response.isOk) throw new Error(response.message);
      return response.data;
    },
    refetchOnWindowFocus: false,
    enabled: user.access_role === "Admin" || user.access_role === "Owner",
  });
  const queryClient = useQueryClient();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [discountToggles, setDiscountToggles] = useState<Map<string, boolean>>(
    new Map()
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isInviting, setIsInviting] = useState(false);
  const [modalOpened, setModalOpened] = useState(false);

  // Prepare selected galleries data for modal
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

  if (loading) {
    return <Load />;
  }

  if (!galleries || galleries.length === 0) {
    return <NotFoundData />;
  }

  const filteredGalleries = galleries.filter(
    (gallery) =>
      gallery.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      gallery.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectAll = () => {
    if (selectedIds.size === filteredGalleries.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredGalleries.map((g) => g.waitlistId)));
    }
  };

  const handleSelectItem = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
      // Remove discount toggle when deselecting user
      const newDiscountToggles = new Map(discountToggles);
      newDiscountToggles.delete(id);
      setDiscountToggles(newDiscountToggles);
    } else {
      newSelected.add(id);
      // Don't modify discount toggle when selecting - keep existing state
    }
    setSelectedIds(newSelected);
  };

  const handleToggleDiscount = (id: string, checked: boolean) => {
    setDiscountToggles(new Map(discountToggles.set(id, checked)));

    // If toggling discount ON, automatically select the user
    if (checked && !selectedIds.has(id)) {
      const newSelected = new Set(selectedIds);
      newSelected.add(id);
      setSelectedIds(newSelected);
    }
  };

  const allSelected =
    selectedIds.size === filteredGalleries.length &&
    filteredGalleries.length > 0;
  const someSelected =
    selectedIds.size > 0 && selectedIds.size < filteredGalleries.length;

  const openInviteModal = () => {
    if (selectedIds.size === 0) return;
    setModalOpened(true);
  };

  async function inviteGalleryUsers() {
    if (selectedIds.size === 0) return;

    setIsInviting(true);

    // Build payload with waitlistId and discount
    const invitePayload: { waitlistId: string; discount: boolean }[] =
      Array.from(selectedIds).map((id) => ({
        waitlistId: id,
        discount: discountToggles.get(id) || false,
      }));

    // API call with simplified payload
    const response = await inviteWaitlistUsers(invitePayload, csrf ?? "");
    if (response.isOk) {
      queryClient.invalidateQueries({
        queryKey: ["fetch_gallery_waitlist_users", "gallery"],
      });
      setSelectedIds(new Set());
      setDiscountToggles(new Map());
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
        selectedEntity={selectedGalleries}
        onConfirmInvite={inviteGalleryUsers}
        isInviting={isInviting}
      />

      {/* Select All Header */}
      <WaitlistHeader
        allSelected={allSelected}
        someSelected={someSelected}
        filteredItemsLength={filteredGalleries.length}
        selectedCount={selectedIds.size}
        isInviting={isInviting}
        searchQuery={searchQuery}
        onSelectAll={handleSelectAll}
        onSearchChange={setSearchQuery}
        onInviteClick={openInviteModal}
      />

      {filteredGalleries.map((gallery) => {
        const isSelected = selectedIds.has(gallery.waitlistId);
        const hasDiscount = discountToggles.get(gallery.waitlistId) || false;
        const currentStyle = statusConfig[isSelected ? "selected" : "default"];
        return (
          <div
            key={gallery.waitlistId}
            className={`
          group relative rounded border 2xl:py-3 py-2 ${currentStyle.borderColor} ${currentStyle.bgColor} 
          backdrop-blur-sm transition-all duration-500 ${currentStyle.shadowColor}
          ${currentStyle.glowColor}
          transform-gpu
          hover:shadow-lg
        `}
          >
            {/* Main content */}
            <div className="relative z-10 grid grid-cols-4 px-4 py-2">
              <div>
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handleSelectItem(gallery.waitlistId)}
                  aria-label={`Select ${gallery.name}`}
                  className="w-5 h-5 rounded border border-black text-slate-900 
                    focus:ring-2 focus:ring-slate-500 focus:ring-offset-0 
                    cursor-pointer transition-all duration-200
                    hover:border-slate-400"
                />
              </div>

              <div className="flex flex-col justify-self-start">
                <h4 className="text-fluid-xs font-medium text-gray-900 transition-colors duration-300 ">
                  {gallery.name}
                </h4>
              </div>
              <div className="flex items-center justify-self-start gap-x-1.5 text-fluid-xxs text-dark">
                <Mail size={18} />
                <span className="font-medium text-fluid-xs">
                  {gallery.email}
                </span>
              </div>
              <div className="flex items-center justify-self-end gap-4">
                <span className="text-sm font-medium text-gray-700">
                  Add discount
                </span>
                <label
                  aria-label={`Add discount for ${gallery.name}`}
                  className="relative inline-block h-[30px] w-[50px] cursor-pointer rounded-full bg-neutral-600 transition [-webkit-tap-highlight-color:_transparent] has-[:checked]:bg-black"
                >
                  <input
                    className="peer sr-only"
                    type="checkbox"
                    checked={hasDiscount}
                    onChange={(e) =>
                      handleToggleDiscount(gallery.waitlistId, e.target.checked)
                    }
                    onClick={(e) => e.stopPropagation()}
                  />
                  <span className="absolute inset-y-0 start-0 m-1 h-[22px] w-[22px] rounded-full bg-white transition-all peer-checked:start-5"></span>
                </label>
              </div>
            </div>
          </div>
        );
      })}
      {filteredGalleries.length === 0 && <NotFoundData />}
    </div>
  );
}
