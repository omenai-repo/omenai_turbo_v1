"use client";
import { Button } from "@mantine/core";
import { Mail } from "lucide-react";
import React, { useState } from "react";

const statusConfig = {
  selected: {
    borderColor: "border-emerald-200",
    bgColor: "bg-gradient-to-r from-emerald-50/80 to-green-50/60",
    shadowColor: "shadow-emerald-100/50",
    indicatorColor: "green",
    glowColor: "ring-emerald-200/50",
  },
  waitlisted: {
    borderColor: "border-amber-200",
    bgColor: "bg-gradient-to-r from-amber-50/80 to-orange-50/60",
    shadowColor: "shadow-amber-100/50",
    indicatorColor: "red",
    glowColor: "ring-amber-200/50",
  },
};

export default function Waitlist() {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");

  const createGallery = (id: string, name: string, email: string) => ({
    waitlistId: id,
    name,
    email,
  });

  const galleries = [
    createGallery("1", "Visage of Beauty", "dantereus1@gmail.com"),
    createGallery("2", "Modern Art Gallery", "contact@modernart.com"),
    createGallery("3", "Gallery Nouveau", "info@gallerynouveau.com"),
    createGallery("4", "The Art Space", "hello@theartspace.net"),
    createGallery("5", "Contemporary Visions", "admin@contemporaryvisions.com"),
    createGallery("6", "Urban Canvas", "contact@urbancanvas.org"),
    createGallery("7", "Studio Gallery", "info@studiogallery.com"),
    createGallery("8", "Artisan Collective", "team@artisancollective.com"),
    createGallery("9", "Spectrum Gallery", "hello@spectrumgallery.net"),
  ];
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
        const currentStyle =
          statusConfig[isSelected ? "selected" : "waitlisted"];
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
          ${isSelected ? "ring-2 ring-slate-400" : ""}
          focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2
          hover:shadow-lg
        `}
          >
            {/* Main content */}
            <div className="relative z-10 flex justify-between items-center px-4 py-2 pointer-events-none">
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

              <div className="flex flex-col">
                <h4 className="text-fluid-xs font-medium text-gray-900 transition-colors duration-300 ">
                  {gallery.name}
                </h4>
              </div>
              <div className="flex items-center gap-x-1.5 text-fluid-xxs text-dark">
                <Mail size={18} />
                <span className="font-medium text-fluid-xs">
                  {gallery.email}
                </span>
              </div>
              <Button
                variant="gradient"
                gradient={{ from: "#0f172a", to: "#0f172a", deg: 45 }}
                size="xs"
                radius="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  // Add your invite logic here
                }}
                className="
                  font-normal text-fluid-xxs px-4 py-2.5 shadow-lg hover:shadow-xl
                  transition-all duration-300 hover:scale-105 active:scale-95
                  ring-1 ring-blue-200/50 hover:ring-blue-300/70
                  transform-gpu pointer-events-auto
                "
                styles={{
                  root: {
                    "&:hover": {
                      transform: "translateY(-2px)",
                    },
                  },
                }}
              >
                Invite
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
