import React, { useState } from "react";
import Link from "next/link";
import {
  getPromotionalFileView,
  getPromotionalOptimizedImage,
} from "@omenai/shared-lib/storage/getPromotionalsFileView";
import { useQueryClient } from "@tanstack/react-query";
import { toast_notif } from "@omenai/shared-utils/src/toast_notification";
import { toggleEventVisibility } from "@omenai/shared-services/gallery/events/toggleEventVisibility";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { GalleryEvent } from "@omenai/shared-types";
interface EventDashboardHeaderProps {
  event: GalleryEvent;
  onEditClick: () => void;
  isUploadingCover: boolean;
  onCoverImageChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const EventDashboardHeader = ({
  event,
  onEditClick,
  isUploadingCover = false,
  onCoverImageChange,
}: EventDashboardHeaderProps) => {
  const queryClient = useQueryClient();
  const { user, csrf } = useAuth({ requiredRole: "gallery" });
  const [isPublishing, setIsPublishing] = useState(false);

  const handleTogglePublish = async () => {
    setIsPublishing(true);
    const newStatus = !event.is_published;

    const response = await toggleEventVisibility(
      event.event_id,
      event.gallery_id,
      newStatus,
      csrf || "",
    );

    if (response.isOk) {
      toast_notif(response.message, "success");
      // Invalidate the query to instantly reflect the new status in the dashboard
      queryClient.invalidateQueries({
        queryKey: ["eventDashboard", event.event_id],
      });
    } else {
      toast_notif(response.message, "error");
    }
    setIsPublishing(false);
  };

  // 1. Dynamic Status Calculation
  const now = new Date();
  const startDate = new Date(event.start_date);
  const endDate = new Date(event.end_date);

  let status = "Upcoming";
  let statusColor = "bg-amber-50 text-amber-700 border-amber-200";

  if (event.is_archived) {
    status = "Archived";
    statusColor = "bg-neutral-100 text-neutral-500 border-neutral-200";
  } else if (now > endDate) {
    status = "Past";
    statusColor = "bg-neutral-100 text-neutral-600 border-neutral-300";
  } else if (now >= startDate && now <= endDate) {
    status = "Active";
    statusColor = "bg-green-50 text-green-700 border-green-200";
  }

  // 2. Elegant Date Formatting
  const formattedStart = startDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const formattedEnd = endDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <>
      {/* 1. Main Header Card (Your existing code) */}
      <div className="w-full bg-white border border-neutral-200 rounded-sm overflow-hidden flex flex-col md:flex-row items-center justify-between p-6 gap-6 shadow-sm">
        {/* Left Side: Visuals & Context */}
        <div className="flex items-center gap-6 w-full md:w-auto">
          {/* Cover Image Thumbnail */}
          {/* Cover Image Thumbnail (Now Interactive!) */}
          <div className="w-32 h-20 shrink-0 bg-neutral-50 overflow-hidden rounded-sm border border-neutral-100 relative group">
            <img
              src={getPromotionalOptimizedImage(event.cover_image, "small")}
              alt={event.title}
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                isUploadingCover
                  ? "opacity-50 blur-sm"
                  : "group-hover:scale-105"
              }`}
            />

            {/* Hover Overlay & File Input */}
            <label
              className={`absolute inset-0 bg-black/40 backdrop-blur-[2px] text-white flex-col items-center justify-center cursor-pointer transition-all duration-300 z-10 ${
                isUploadingCover
                  ? "flex opacity-100"
                  : "opacity-0 group-hover:opacity-100 flex"
              }`}
            >
              {isUploadingCover ? (
                <span className="text-[9px] uppercase tracking-widest font-medium animate-pulse">
                  Saving...
                </span>
              ) : (
                <>
                  <svg
                    className="w-4 h-4 mb-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                    />
                  </svg>
                  <span className="text-[9px] uppercase tracking-widest font-medium">
                    Replace
                  </span>
                </>
              )}

              {/* The actual hidden input */}
              <input
                type="file"
                accept="image/jpeg, image/png, image/webp"
                className="hidden"
                onChange={onCoverImageChange}
                disabled={isUploadingCover}
              />
            </label>
          </div>

          {/* Title & Metadata */}
          <div className="flex flex-col">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              {/* Temporal Status */}
              <span
                className={`px-2.5 py-0.5 rounded-full text-[9px] uppercase tracking-widest font-medium border ${statusColor}`}
              >
                {status}
              </span>

              {/* NEW: Visibility Status */}
              <span
                className={`px-2.5 py-0.5 rounded-full text-[9px] uppercase tracking-widest font-medium border ${
                  event.is_published
                    ? "bg-green-50 text-green-700 border-green-200"
                    : "bg-amber-50 text-amber-700 border-amber-200"
                }`}
              >
                {event.is_published ? "Event Published" : "Draft"}
              </span>

              <span className="text-[10px] text-neutral-400 uppercase tracking-widest">
                {event.event_type.replace("_", " ")}
              </span>
            </div>
            <h1 className="text-2xl font-light text-dark mb-1">
              {event.title}
            </h1>
            <p className="text-xs text-neutral-500 tracking-wide">
              {formattedStart} — {formattedEnd}
            </p>
          </div>
        </div>

        {/* Right Side: Quick Actions */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto shrink-0">
          <button
            type="button"
            onClick={onEditClick}
            className="px-6 py-2.5 text-xs font-medium tracking-widest uppercase transition-colors duration-300 rounded-sm border border-neutral-200 text-neutral-600 hover:border-dark hover:text-dark"
          >
            Edit Details
          </button>

          {/* NEW: Publish / Unpublish Toggle */}
          <button
            onClick={handleTogglePublish}
            disabled={isPublishing}
            className={`px-6 py-2.5 text-xs font-medium tracking-widest uppercase transition-all duration-300 rounded-sm shadow-sm disabled:opacity-50 ${
              event.is_published
                ? "bg-white text-dark border border-neutral-200 hover:border-dark" // Unpublish styling
                : "bg-dark text-white border border-dark hover:bg-neutral-800" // Publish styling
            }`}
          >
            {isPublishing
              ? "Updating..."
              : event.is_published
                ? "Unpublish"
                : "Publish this event"}
          </button>

          {/* Updated: View Live / Preview as an Icon Button */}
          <Link
            href={`/shows/${event.event_id}`}
            target="_blank"
            className="p-2.5 text-neutral-400 border border-transparent hover:border-neutral-200 hover:text-dark transition-all duration-300 rounded-sm bg-neutral-50 hover:bg-neutral-100"
            title={
              event.is_published ? "View Live Presentation" : "Preview Draft"
            }
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          </Link>
        </div>
      </div>

      {/* 2. Dynamic Logistics & Metadata Strip */}
      <div className="w-full bg-white border border-neutral-200 rounded-sm shadow-sm flex flex-wrap items-center mt-6">
        {/* Universal: VIP Preview Date */}
        {event.vip_preview_date && (
          <div className="flex flex-col px-6 py-4 border-r border-neutral-100 flex-grow sm:flex-grow-0">
            <span className="text-[9px] text-neutral-400 uppercase tracking-widest mb-1 font-medium">
              VIP Access
            </span>
            <span className="text-sm font-light text-dark">
              {new Date(event.vip_preview_date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
        )}

        {/* Dynamic: Art Fair Specifics */}
        {event.event_type === "art_fair" && (
          <>
            {event.booth_number && (
              <div className="flex flex-col px-6 py-4 border-r border-neutral-100 flex-grow sm:flex-grow-0">
                <span className="text-[9px] text-neutral-400 uppercase tracking-widest mb-1 font-medium">
                  Booth
                </span>
                <span className="text-sm font-light text-dark">
                  {event.booth_number}
                </span>
              </div>
            )}
            {event.location?.city && (
              <div className="flex flex-col px-6 py-4 border-r border-neutral-100 flex-grow sm:flex-grow-0">
                <span className="text-[9px] text-neutral-400 uppercase tracking-widest mb-1 font-medium">
                  Location
                </span>
                <span className="text-sm font-light text-dark">
                  {event.location.city}
                  {event.location.country ? `, ${event.location.country}` : ""}
                </span>
              </div>
            )}
          </>
        )}

        {/* Dynamic: Exhibition Specifics */}
        {event.event_type === "exhibition" && (
          <>
            {event.location?.venue && (
              <div className="flex flex-col px-6 py-4 border-r border-neutral-100 flex-grow sm:flex-grow-0">
                <span className="text-[9px] text-neutral-400 uppercase tracking-widest mb-1 font-medium">
                  Venue
                </span>
                <span className="text-sm font-light text-dark">
                  {event.location.venue}
                </span>
              </div>
            )}
            {event.location?.city && (
              <div className="flex flex-col px-6 py-4 border-r border-neutral-100 flex-grow sm:flex-grow-0">
                <span className="text-[9px] text-neutral-400 uppercase tracking-widest mb-1 font-medium">
                  City
                </span>
                <span className="text-sm font-light text-dark">
                  {event.location.city}
                  {event.location.country ? `, ${event.location.country}` : ""}
                </span>
              </div>
            )}
          </>
        )}

        {/* Dynamic: Viewing Room Specifics */}
        {event.event_type === "viewing_room" && event.external_url && (
          <div className="flex flex-col px-6 py-4 border-r border-neutral-100 flex-grow sm:flex-grow-0">
            <span className="text-[9px] text-neutral-400 uppercase tracking-widest mb-1 font-medium">
              External Link
            </span>
            <a
              href={event.external_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-light text-dark underline underline-offset-4 hover:text-neutral-500 transition-colors line-clamp-1"
            >
              {new URL(event.external_url).hostname.replace("www.", "")}
            </a>
          </div>
        )}

        {/* Empty State Fallback */}
        {!event.vip_preview_date &&
          !event.booth_number &&
          !event.location?.city &&
          !event.location?.venue &&
          !event.external_url && (
            <div className="px-6 py-4 w-full">
              <span className="text-[10px] italic text-neutral-400">
                No additional logistics details provided. Click "Edit Details"
                to add.
              </span>
            </div>
          )}
      </div>
    </>
  );
};
