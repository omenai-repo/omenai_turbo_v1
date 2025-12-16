"use client";
import { Button } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { Mail } from "lucide-react";
import React, { useState } from "react";
import { fetchWaitlistUsers } from "@omenai/shared-services/admin/fetch_waitlist_users";
import { WaitListTypes } from "@omenai/shared-types";
import Load from "@omenai/shared-ui-components/components/loader/Load";
import NotFoundData from "@omenai/shared-ui-components/components/notFound/NotFoundData";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";

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

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [discountToggles, setDiscountToggles] = useState<Map<string, boolean>>(
    new Map()
  );
  const [searchQuery, setSearchQuery] = useState("");

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
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleToggleDiscount = (id: string, checked: boolean) => {
    setDiscountToggles(new Map(discountToggles.set(id, checked)));
  };

  const handleRowKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleSelectItem(id);
    }
  };

  const allSelected =
    selectedIds.size === galleries.length && galleries.length > 0;
  const someSelected =
    selectedIds.size > 0 && selectedIds.size < galleries.length;

  return (
    <div className="w-full p-1 flex flex-col gap-6">
      {/* Select All Header */}
      <div className="flex items-center justify-between gap-3 px-4">
        <label className="flex items-center gap-2 cursor-pointer group">
          <input
            type="checkbox"
            disabled={filteredGalleries.length === 0}
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
            Select All
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
            disabled={filteredGalleries.length === 0}
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
            Invite Selected
          </Button>
        </div>
      </div>

      {filteredGalleries.map((gallery) => {
        const isSelected = selectedIds.has(gallery.waitlistId);
        const hasDiscount = discountToggles.get(gallery.waitlistId) || false;
        const currentStyle = statusConfig[isSelected ? "selected" : "default"];
        return (
          <div
            key={gallery.waitlistId}
            role="button"
            tabIndex={0}
            onClick={() => handleSelectItem(gallery.waitlistId)}
            onKeyDown={(e) => handleRowKeyDown(e, gallery.waitlistId)}
            aria-label={`${isSelected ? "Deselect" : "Select"} ${gallery.name}`}
            className={`
          group relative rounded border 2xl:py-3 py-2 ${currentStyle.borderColor} ${currentStyle.bgColor} 
          backdrop-blur-sm transition-all duration-500 ${currentStyle.shadowColor}
          ${currentStyle.glowColor}
          transform-gpu cursor-pointer
          focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2
          hover:shadow-lg
        `}
          >
            {/* Main content */}
            <div className="relative z-10 grid grid-cols-4 px-4 py-2 pointer-events-none">
              <div className="pointer-events-auto">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handleSelectItem(gallery.waitlistId)}
                  onClick={(e) => e.stopPropagation()}
                  aria-label={`Select ${gallery.name}`}
                  tabIndex={-1}
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
              <div className="flex items-center justify-self-end gap-4 pointer-events-auto">
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
