// TrackingTimeline.tsx - Timeline showing shipment events
"use client";

import { TrackingEvent } from "@omenai/shared-types";
import {
  CheckCircle2,
  Circle,
  Calendar,
  ChevronDown,
  Package,
} from "lucide-react";
import { useState } from "react";

interface TrackingTimelineProps {
  events: TrackingEvent[];
  currentStatus: string;
}

export default function TrackingTimeline({
  events,
  currentStatus,
}: TrackingTimelineProps) {
  const INITIAL_DISPLAY_COUNT = 5;
  const [showAll, setShowAll] = useState(false);

  const reversedEvents = [...events].reverse();
  const displayedEvents = showAll
    ? reversedEvents
    : reversedEvents.slice(0, INITIAL_DISPLAY_COUNT);
  const hasMore = reversedEvents.length > INITIAL_DISPLAY_COUNT;

  const getStatusStyles = (index: number) => {
    if (index === 0) {
      return {
        bg: "bg-gradient-to-br from-emerald-500 to-teal-600",
        ring: "ring-4 ring-emerald-100",
        icon: "text-white",
      };
    }
    return {
      bg: "bg-gradient-to-br from-slate-700 to-slate-800",
      ring: "ring-2 ring-slate-200",
      icon: "text-white",
    };
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      {/* Current Status Card */}
      <div className="relative mb-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded p-4 text-white shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded -ml-16 -mb-16" />

        <div className="relative">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded flex items-center justify-center">
              <Package className="w-6 h-6" />
            </div>
            <h2 className="text-fluid-base font-medium">Current Status</h2>
          </div>
          <p className="text-fluid-xs text-white/90 ml-15 font-light">
            {currentStatus}
          </p>
        </div>
      </div>

      {/* Timeline Header */}
      <div className="mb-8">
        <h3 className="text-fluid-sm font-semibold text-slate-900 mb-1">
          Shipment Journey
        </h3>
        <p className="text-fluid-xs text-slate-600">
          Follow your artwork's journey from origin to destination
        </p>
      </div>

      {/* Timeline */}
      <div className="relative space-y-6">
        {/* Vertical connecting line */}
        <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-gradient-to-b from-slate-300 via-slate-200 to-transparent" />

        {displayedEvents.map((event, index) => {
          const isLatest = index === 0;
          const styles = getStatusStyles(index);

          return (
            <div
              key={index}
              className="relative"
              style={{
                animation: `fadeIn 0.4s ease-out ${index * 0.1}s both`,
              }}
            >
              <div className="flex gap-3 group">
                {/* Timeline Node */}
                <div className="relative flex-shrink-0 z-10">
                  <div
                    className={`w-12 h-12 rounded ${styles.bg} ${styles.ring} flex items-center justify-center shadow-sm group-hover:scale-110 transition-all duration-300`}
                  >
                    {isLatest ? (
                      <CheckCircle2 className={`w-6 h-6 ${styles.icon}`} />
                    ) : (
                      <Circle
                        className={`w-4 h-4 ${styles.icon} fill-current`}
                      />
                    )}
                  </div>
                  {isLatest && (
                    <div className="absolute inset-0 rounded bg-emerald-500 animate-ping opacity-20" />
                  )}
                </div>

                {/* Event Card */}
                <div className="flex-1 pb-2">
                  <div className="bg-white rounded border-2 border-slate-100 hover:border-slate-300 hover:shadow-xl transition-all duration-300 p-5 group-hover:-translate-y-1">
                    {/* Date Badge */}
                    <div className="inline-flex items-center gap-2 bg-slate-50 rounded px-2 py-1.5">
                      <Calendar className="w-4 h-4 text-slate-600" />
                      <span className="text-fluid-xxs font-light text-slate-700">
                        {event.date} at {event.time}
                      </span>
                    </div>

                    {/* Status Title */}
                    <h4 className="text-fluid-xs font-medium text-slate-900 mb-2">
                      {event.serviceArea[0].description ||
                        event.typeCode ||
                        "Status Update"}
                    </h4>

                    {/* Description */}
                    {event.description && (
                      <p className="text-fluid-xs text-slate-600 leading-relaxed">
                        {event.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Show More/Less Button */}
        {hasMore && (
          <div className="flex justify-center pt-4">
            <button
              onClick={() => setShowAll(!showAll)}
              className="group flex items-center gap-2 bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-slate-300 rounded px-6 py-3 text-fluid-xs font-medium text-slate-700 transition-all duration-300 shadow-sm hover:shadow-md"
            >
              <span>
                {showAll
                  ? "Show Less"
                  : `Show ${reversedEvents.length - INITIAL_DISPLAY_COUNT} More Events`}
              </span>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-300 ${
                  showAll ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
