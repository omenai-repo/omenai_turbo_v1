// components/programming/ProgrammingEventCard.tsx
import { getPromotionalOptimizedImage } from "@omenai/shared-lib/storage/getPromotionalsFileView";
import {
  EventType,
  GalleryEvent,
  GalleryEventType,
} from "@omenai/shared-types";
import Image from "next/image";
import Link from "next/link";
import { getEventStatus } from "../script/getEventStatus";

// 2. Define the strict mappings OUTSIDE the component
const eventTypeDisplay: Record<GalleryEventType, string> = {
  exhibition: "Exhibition",
  art_fair: "Art Fair",
  viewing_room: "Viewing Room",
};

const typeTooltip: Record<GalleryEventType, string> = {
  exhibition: "Physical gallery show hosted at your venue.",
  art_fair: "External commercial fair with booth details.",
  viewing_room: "Digital-only exclusive presentation.",
};

interface ProgrammingEventCardProps {
  event: GalleryEvent;
  status: "active" | "upcoming" | "past";
}

export const ProgrammingEventCard = ({
  event,
  status,
}: ProgrammingEventCardProps) => {
  const displayLabel = eventTypeDisplay[event.event_type];
  const tooltipText = typeTooltip[event.event_type];

  // Format dates elegantly (e.g., "Apr 17 - May 24, 2026")
  const formatDateRange = (start: Date, end: Date) => {
    const startStr = new Date(start).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    const endStr = new Date(end).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    return `${startStr} — ${endStr}`;
  };

  const image_href = getPromotionalOptimizedImage(event.cover_image, "medium");
  const statusUpdate = getEventStatus(event.start_date, event.end_date);
  return (
    <div className="group flex flex-col relative bg-white transition-all duration-500 hover:-translate-y-1">
      {/* Editorial Image Container (4:3 aspect ratio) */}
      <Link
        href={`/gallery/programming/${event.event_id}`}
        className="block relative w-full aspect-[4/3] bg-neutral-100 overflow-hidden rounded-sm mb-4"
      >
        <Image
          src={image_href}
          alt={event.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />

        {/* Status Indicator (Top Right) */}

        <div className="absolute z-10 top-3 right-3 flex items-center gap-2 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-sm  shadow-sm">
          <span
            className={`w-1.5 h-1.5 rounded-sm -full ${statusUpdate === "Active" ? "bg-green-500 animate-pulse" : statusUpdate === "Upcoming" ? "bg-amber-500" : "bg-neutral-400"}`}
          />
          <span className="text-[10px] uppercase tracking-widest text-neutral-900 font-medium">
            {statusUpdate}
          </span>
        </div>
      </Link>

      {/* Content Area */}
      <div className="flex flex-col px-1">
        <div className="flex items-center justify-between mb-2 relative group/tooltip cursor-help">
          <p className="text-[10px] uppercase tracking-[0.15em] text-neutral-500 border-b border-dashed border-neutral-300 pb-0.5">
            {displayLabel}
          </p>

          {/* Micro-Tooltip for Event Type */}
          <div className="absolute bottom-full left-0 mb-2 w-48 opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-opacity duration-200 z-10">
            <div className="bg-neutral-900 text-white text-[11px] font-light p-2.5 rounded-sm   shadow-xl leading-relaxed">
              {tooltipText}
              {/* Little triangle pointer */}
              <div className="absolute top-full left-4 -mt-px border-4 border-transparent border-t-neutral-900" />
            </div>
          </div>
        </div>

        <Link href={`/gallery/programming/${event.event_id}`}>
          <h3 className="text-lg font-light text-dark leading-snug mb-1.5 group-hover:text-neutral-600 transition-colors line-clamp-1">
            {event.title}
          </h3>
        </Link>

        <p className="text-xs text-neutral-500 tracking-wide mb-3">
          {formatDateRange(event.start_date, event.end_date)}
        </p>

        {/* Modular Context Line (Where is this happening?) */}
        <div className="flex items-center text-[11px] text-neutral-400 font-medium tracking-wide">
          {event.event_type === "art_fair" && event.booth_number && (
            <span>
              Booth {event.booth_number} •{" "}
              {event.location?.city || "External Venue"}
            </span>
          )}
          {event.event_type === "exhibition" && (
            <span>{event.location?.venue || "Gallery Space"}</span>
          )}
          {event.event_type === "viewing_room" && (
            <span className="flex items-center gap-1">
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                />
              </svg>
              Omenai Exclusive
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
