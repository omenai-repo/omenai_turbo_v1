"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Circle,
  ChevronDown,
  MapPin,
  Truck,
  AlertOctagon,
} from "lucide-react";
import { TrackingEvent, TrackingStatus } from "@omenai/shared-types";

interface TrackingTimelineProps {
  events: TrackingEvent[];
  currentStatus: TrackingStatus;
  carrier: "DHL" | "UPS";
}

export default function TrackingTimeline({
  events,
  currentStatus,
  carrier,
}: TrackingTimelineProps) {
  const [showAll, setShowAll] = useState(false);
  const INITIAL_COUNT = 4;

  if (!events || events.length === 0) return null;

  // 1. FORCE SORT (Newest First)
  // We create a copy [...events] to avoid mutating the original prop
  const sortedEvents = [...events].sort((a, b) => {
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  const displayedEvents = showAll
    ? sortedEvents
    : sortedEvents.slice(0, INITIAL_COUNT);
  const hasMore = sortedEvents.length > INITIAL_COUNT;

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 pb-12">
      <div className="bg-white rounded shadow-sm border border-slate-200 overflow-hidden">
        {/* Status Header */}
        <div className="bg-slate-900 p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded -full mix-blend-overlay filter blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10">
            <h2 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">
              Latest Status
            </h2>
            <p className="text-2xl font-semibold tracking-tight capitalize">
              {currentStatus.replace("_", " ").toLowerCase()}
            </p>
          </div>
        </div>

        {/* Timeline */}
        <div className="p-8">
          <div className="space-y-8 relative">
            {/* Vertical Line */}
            <div className="absolute left-[19px] top-3 bottom-3 w-[2px] bg-slate-100 z-0"></div>

            {displayedEvents.map((event, index) => {
              const isLatest = index === 0;

              return (
                <div key={index} className="relative flex gap-6 z-10">
                  {/* Icon */}
                  <div
                    className={`w-10 h-10 rounded -full flex items-center justify-center border-4 transition-all duration-300 flex-shrink-0 ${
                      isLatest
                        ? "bg-slate-900 border-slate-100 text-white shadow-lg"
                        : "bg-white border-slate-100 text-slate-300"
                    }`}
                  >
                    {event.status_label === "DELIVERED" ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : event.status_label === "EXCEPTION" ? (
                      <AlertOctagon className="w-4 h-4" />
                    ) : isLatest ? (
                      <Truck className="w-4 h-4" />
                    ) : (
                      <Circle className="w-3 h-3 fill-slate-300 stroke-none" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pt-1.5">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2">
                      <div>
                        <h4
                          className={`text-base font-semibold ${isLatest ? "text-slate-900" : "text-slate-700"}`}
                        >
                          {event.description}
                        </h4>
                        <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                          <MapPin className="w-3 h-3" />
                          {event.location}
                        </p>
                      </div>

                      <div className="text-right flex flex-row md:flex-col items-center md:items-end gap-2 md:gap-0 text-sm text-slate-500">
                        <span className="font-medium text-slate-900">
                          {formatDate(event.timestamp)}
                        </span>
                        <span className="text-xs">
                          {formatTime(event.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Show More */}
          {hasMore && (
            <div className="mt-8 text-center pt-8 border-t border-slate-50">
              <button
                onClick={() => setShowAll(!showAll)}
                className="text-sm font-semibold text-slate-900 hover:text-blue-600 flex items-center justify-center gap-2 mx-auto transition-colors"
              >
                {showAll
                  ? "Show Less"
                  : `View ${sortedEvents.length - INITIAL_COUNT} Older Updates`}
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${showAll ? "rotate-180" : ""}`}
                />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
