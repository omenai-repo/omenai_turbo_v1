"use client";

import { TrackingEvent } from "@omenai/shared-types";
import {
  CheckCircle2,
  Circle,
  Clock,
  ChevronDown,
  MapPin,
  Truck,
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

  // Deep copy and reverse to show newest first
  const reversedEvents = [...events].reverse();
  const displayedEvents = showAll
    ? reversedEvents
    : reversedEvents.slice(0, INITIAL_DISPLAY_COUNT);
  const hasMore = reversedEvents.length > INITIAL_DISPLAY_COUNT;

  return (
    <div className="w-full max-w-5xl mx-auto px-4 pb-12">
      {/* Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Header / Current Status */}
        <div className="bg-slate-900 p-6 md:p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full mix-blend-overlay filter blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10">
            <h2 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">
              Current Status
            </h2>
            <div className="flex items-center gap-3">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <p className="text-xl md:text-2xl font-semibold tracking-tight">
                {currentStatus}
              </p>
            </div>
          </div>
        </div>

        {/* Timeline Body */}
        <div className="p-6 md:p-10">
          <div className="relative">
            {/* Vertical Line */}
            <div className="absolute left-[19px] top-2 bottom-0 w-[2px] bg-slate-100"></div>

            <div className="space-y-8">
              {displayedEvents.map((event, index) => {
                const isLatest = index === 0;

                return (
                  <div
                    key={index}
                    className="relative flex gap-6 md:gap-10 group"
                  >
                    {/* Icon Column */}
                    <div className="flex flex-col items-center flex-shrink-0 z-10">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center border-4 transition-colors duration-300 ${
                          isLatest
                            ? "bg-blue-600 border-blue-100 text-white shadow-lg shadow-blue-200"
                            : "bg-white border-slate-100 text-slate-300"
                        }`}
                      >
                        {isLatest ? (
                          <Truck className="w-4 h-4" />
                        ) : (
                          <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                        )}
                      </div>
                    </div>

                    {/* Content Column */}
                    <div className="flex-1 pt-1">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2 md:gap-8">
                        {/* Status & Desc */}
                        <div className="flex-1">
                          <h4
                            className={`text-base font-semibold mb-1 ${isLatest ? "text-slate-900" : "text-slate-700"}`}
                          >
                            {event.serviceArea[0].description ||
                              event.typeCode ||
                              "Status Update"}
                          </h4>
                          <p className="text-sm text-slate-500 leading-relaxed">
                            {event.description}
                          </p>
                          {/* Mobile Date (Visible only on small screens) */}
                          <div className="md:hidden mt-2 flex items-center gap-2 text-xs text-slate-400">
                            <Clock className="w-3 h-3" />
                            <span>
                              {event.date} • {event.time}
                            </span>
                          </div>
                        </div>

                        {/* Desktop Date/Location Badge */}
                        <div className="hidden md:flex flex-col items-end text-right">
                          <span className="text-sm font-bold text-slate-900">
                            {event.date}
                          </span>
                          <span className="text-xs text-slate-500 font-medium">
                            {event.time}
                          </span>
                          {event.serviceArea[0].description && (
                            <div className="mt-1 inline-flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                              <MapPin className="w-3 h-3" />
                              {event.serviceArea[0].description} // Assuming
                              this is location data
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Expand Button */}
            {hasMore && (
              <div className="relative pt-8 pl-16">
                {/* Fade out effect */}
                {!showAll && (
                  <div className="absolute -top-12 left-0 w-full h-12 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
                )}

                <button
                  onClick={() => setShowAll(!showAll)}
                  className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  {showAll ? (
                    <>
                      Show Less <ChevronDown className="w-4 h-4 rotate-180" />
                    </>
                  ) : (
                    <>
                      View {reversedEvents.length - INITIAL_DISPLAY_COUNT} older
                      updates <ChevronDown className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
