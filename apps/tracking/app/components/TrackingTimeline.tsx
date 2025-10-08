// TrackingTimeline.tsx - Timeline showing shipment events
"use client";

import { TrackingEvent } from "@omenai/shared-types";
import { CheckCircle2, Circle, Calendar } from "lucide-react";

interface TrackingTimelineProps {
  events: TrackingEvent[];
  currentStatus: string;
}

export default function TrackingTimeline({
  events,
  currentStatus,
}: TrackingTimelineProps) {
  // const formatDate = (timestamp: string) => {
  //   const date = new Date(timestamp);
  //   return {
  //     date: date.toLocaleDateString("en-US", {
  //       month: "short",
  //       day: "numeric",
  //       year: "numeric",
  //     }),
  //     time: date.toLocaleTimeString("en-US", {
  //       hour: "2-digit",
  //       minute: "2-digit",
  //     }),
  //   };
  // };

  const getStatusColor = (index: number) => {
    if (index === 0) return "bg-dark/50 ";
    return "from-[#0f172a] to-[#1e293b]";
  };

  const reversedEvents = [...events].reverse();

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      {/* Current Status Banner */}
      <div className="mb-4 bg-dark rounded p-4 text-white shadow-xl">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-6 h-6" />
          <h2 className="text-fluid-xxs md:text-fluid-base font-medium">
            Current Status
          </h2>
        </div>
        <p className="text-fluid-xxs md:text-fluid-base font-normal ml-9 md:ml-10">
          {currentStatus}
        </p>
      </div>

      {/* Timeline Header */}
      <div className="mb-6">
        <h3 className="text-fluid-base font-medium text-[#0f172a]">
          Shipment History
        </h3>
        <p className="text-fluid-xxs text-gray-600">
          Track your artwork&apos;s journey from origin to destination
        </p>
      </div>

      {/* Timeline */}
      <div className="relative">
        {reversedEvents.map((event, index) => {
          const isLatest = index === 0;

          return (
            <div key={index} className="relative pb-8 last:pb-0">
              {/* Vertical Line */}
              {index !== reversedEvents.length - 1 && (
                <div className="absolute left-4 md:left-5 top-10 md:top-12 bottom-0 w-0.5 bg-gradient-to-b from-gray-300 to-transparent"></div>
              )}

              <div className="relative flex gap-4 md:gap-6 group">
                {/* Icon */}
                <div className="relative flex-shrink-0">
                  <div
                    className={`w-8 h-8 md:w-10 md:h-10 rounded bg-gradient-to-br ${getStatusColor(index)} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}
                  >
                    {isLatest ? (
                      <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-dark" />
                    ) : (
                      <Circle className="w-3 h-3 text-dark fill-dark" />
                    )}
                  </div>
                  {isLatest && (
                    <div className="absolute inset-0 rounded bg-gradient-to-br from-dark/50 to-teal-500 animate-ping opacity-20"></div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 bg-white rounded shadow-md hover:shadow-xl transition-shadow duration-300 p-4 border border-gray-100">
                  {/* Date & Time */}
                  <div className="flex flex-wrap items-center mb-1 text-fluid-xxs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <p className="text-fluid-xxs font-normal text-gray-500 break-words">
                        {event.date} at {event.time}
                      </p>
                    </div>
                  </div>

                  {/* Status */}
                  <p className="text-fluid-xxs md:text-fluid-base font-medium text-[#0f172a] mb-1">
                    {event.serviceArea[0].description ||
                      event.typeCode ||
                      "Status Unknown"}
                  </p>

                  {/* Description */}
                  {event.description && (
                    <p className="text-fluid-xxs text-gray-600">
                      {event.description}
                    </p>
                  )}

                  {/* Location */}
                  {/* <div className="flex items-start gap-2 text-fluid-sm text-gray-700 bg-gray-50 rounded-lg p-3">
                    <MapPin className="w-4 h-4 md:w-4.5 md:h-4.5 flex-shrink-0 mt-0.5 text-[#0f172a]" />
                    <span className="break-words">
                      {location.address_line}
                      {location.zip && `, ${location.zip}`}
                      {location.countryCode && ` - ${location.countryCode}`}
                    </span>
                  </div> */}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
