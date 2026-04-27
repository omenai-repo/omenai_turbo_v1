// app/gallery/programming/GalleryProgrammingDashboard.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { fetchEvents } from "@omenai/shared-services/gallery/events/fetchEvents"; // Use your actual hook/service
import { GalleryEvent } from "@omenai/shared-types";
import { ProgrammingEmptyState } from "./ProgrammingEmptyState";
import { ProgrammingEventCard } from "./ProgrammingEventCard";

export const GalleryProgrammingDashboard = () => {
  const { user, csrf } = useAuth({ requiredRole: "gallery" });
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"active" | "past">("active");
  const [isLoading, setIsLoading] = useState(true);
  const [events, setEvents] = useState<{
    active: GalleryEvent[];
    past: GalleryEvent[];
  }>({
    active: [],
    past: [],
  });

  const loadProgramming = useCallback(async () => {
    setIsLoading(true);
    try {
      // Execute standard authenticated fetch (replace with your specific CSRF/auth pattern)
      const res = await fetchEvents(user.gallery_id, csrf || "");
      if (res.isOk) {
        setEvents({
          active: res.activeEvents || [],
          past: res.pastEvents || [],
        });
      }
    } catch (error) {
      console.error("Failed to load programming", error);
    } finally {
      setIsLoading(false);
    }
  }, [user.gallery_id, csrf]);

  useEffect(() => {
    loadProgramming();
  }, [loadProgramming]);

  const currentDisplayData =
    activeTab === "active" ? events.active : events.past;

  return (
    <div className="w-full max-w-full mx-auto">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-6">
        <div>
          <h1 className="text-3xl font-light tracking-tight text-dark mb-2">
            Programming
          </h1>
          <p className="text-sm text-neutral-500 tracking-wide flex items-center gap-1.5 cursor-help group/tooltip relative w-max">
            Manage your exhibitions, fairs, and viewing rooms.
            <svg
              className="w-4 h-4 text-neutral-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {/* Header Micro-Tooltip */}
            <span className="absolute left-full ml-2 w-64 opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-opacity duration-200 z-10 bg-neutral-900 text-white text-[11px] font-light p-2.5 rounded-sm  shadow-xl leading-relaxed">
              Events created here will automatically update the status of any
              attached artworks in your inventory.
            </span>
          </p>
        </div>

        <button
          onClick={() => router.push("/gallery/programming/create")}
          className="bg-dark text-white px-6 py-3 text-xs font-medium tracking-widest uppercase hover:bg-neutral-800 transition-colors duration-300 rounded-sm  shrink-0"
        >
          + Create Event
        </button>
      </div>

      {/* Editorial Tabs */}
      <div className="flex border-b border-neutral-200 mb-8">
        <button
          onClick={() => setActiveTab("active")}
          className={`pb-4 px-1 mr-8 text-sm font-medium transition-colors relative ${
            activeTab === "active"
              ? "text-dark"
              : "text-neutral-400 hover:text-dark"
          }`}
        >
          Upcoming & Active
          {activeTab === "active" && (
            <span className="absolute bottom-0 left-0 w-full h-px bg-dark" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("past")}
          className={`pb-4 px-1 text-sm font-medium transition-colors relative ${
            activeTab === "past"
              ? "text-dark"
              : "text-neutral-400 hover:text-dark"
          }`}
        >
          Past Archives
          {activeTab === "past" && (
            <span className="absolute bottom-0 left-0 w-full h-px bg-dark" />
          )}
        </button>
      </div>

      {/* Grid or Empty State */}
      {isLoading ? (
        <div className="w-full py-32 flex justify-center items-center">
          <span className="text-[10px] tracking-[0.2em] uppercase text-neutral-400">
            Loading curations...
          </span>
        </div>
      ) : currentDisplayData.length === 0 ? (
        <ProgrammingEmptyState
          view={activeTab}
          onCreateClick={() => router.push("/gallery/programming/create")}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-12">
          {currentDisplayData.map((event) => (
            <ProgrammingEventCard
              key={event.event_id}
              event={event}
              // Calculate status dynamically based on dates
              status={
                event.is_archived || new Date(event.end_date) < new Date()
                  ? "past"
                  : new Date(event.start_date) > new Date()
                    ? "upcoming"
                    : "active"
              }
            />
          ))}
        </div>
      )}
    </div>
  );
};
