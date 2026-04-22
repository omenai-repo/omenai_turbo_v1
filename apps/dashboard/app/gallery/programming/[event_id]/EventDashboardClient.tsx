// app/gallery/programming/[event_id]/EventDashboardClient.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { toast_notif } from "@omenai/shared-utils/src/toast_notification";
import { fetchEventDashboardData } from "@omenai/shared-services/gallery/events/fetchEventDashboardData";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { EventDashboardHeader } from "./components/EventDashboardHeader";
import { EventInventoryGrid } from "./components/EventInventoryGrid";
import { ArtworkSelectorModal } from "../components/ArtworkSelectorModal";
import { updateEventArtwork } from "@omenai/shared-services/gallery/events/updateEventArtwork";
import { ArtworkSchemaTypes } from "@omenai/shared-types";
import { archiveEvent } from "@omenai/shared-services/gallery/events/archiveEvents";
import { EditEventModal } from "./components/EditEventModal";
import { InstallationViewsManager } from "./components/InstallationViewsManager";
import { ConfirmActionModal } from "./components/ConfirmActionModal";
import { updateArtworkSequence } from "@omenai/shared-services/gallery/events/updateArtworkSequence";
import { VipLinkManager } from "./components/VipLinkManager";
import uploadEventImage from "../script/uploadEventCoverImage";
import { updateEventData } from "@omenai/shared-services/gallery/events/updateEventData";

export const EventDashboardClient = ({ eventId }: { eventId: string }) => {
  const { user, csrf } = useAuth({ requiredRole: "gallery" });
  const router = useRouter();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [isArchiving, setIsArchiving] = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);

  const [isUploadingCover, setIsUploadingCover] = useState(false);

  const handleCoverImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Optional: Basic validation
    if (file.size > 5 * 1024 * 1024) {
      toast_notif("Image must be less than 5MB", "error");
      return;
    }

    setIsUploadingCover(true);

    try {
      // 1. Upload to your Appwrite bucket
      // Note: Replace this line with your actual Appwrite upload utility
      const uploadedFileId = await uploadEventImage(file);

      if (!uploadedFileId) {
        toast_notif("Failed to upload image.", "error");
        return;
      }

      // 2. Update the database
      const response = await updateEventData(
        event.gallery_id,
        event.event_id,
        {
          cover_image: uploadedFileId.$id,
        },
        csrf || "",
      );

      if (response.isOk) {
        toast_notif(response.message, "success");
        queryClient.invalidateQueries({
          queryKey: ["eventDashboard", event.event_id],
        });

        // Bonus: If you want to keep your storage clean, you can trigger a
        // background action here to delete the old `event.cover_image` from Appwrite!
      } else {
        toast_notif(response.message, "error");
      }
    } catch (error) {
      toast_notif("Failed to upload image.", "error");
    } finally {
      setIsUploadingCover(false);
    }
  };

  const handleArchiveEvent = async () => {
    if (!user.gallery_id) return;

    setIsArchiveModalOpen(false); // Close the modal instantly
    setIsArchiving(true); // Lock the UI in the loading state

    const response = await archiveEvent(user.gallery_id, eventId, csrf || "");

    if (response.isOk) {
      toast_notif("Event archived successfully.", "success");
      queryClient.invalidateQueries({
        queryKey: ["eventDashboard", eventId, user.gallery_id],
      });
      router.replace("/gallery/programming");
    } else {
      toast_notif(response.message, "error");
    }
    setIsArchiving(false);
  };
  const handleRemoveArtwork = async (artworkId: string) => {
    console.log("Trigger backend to remove and un-mutex:", artworkId);
    const response = await updateEventArtwork(
      eventId,
      user.gallery_id,
      artworkId,
      "remove",
      csrf || "",
    );
    if (response.isOk) {
      toast_notif("Work removed from presentation.", "success");
      queryClient.invalidateQueries({
        queryKey: ["eventDashboard", eventId, user.gallery_id],
      });
    } else {
      toast_notif(response.message, "error");
    }
  };

  const handleAddArtworks = async (payload: any) => {
    const response = await updateEventArtwork(
      eventId,
      user.gallery_id,
      payload.featured_artworks,
      "add",
      csrf || "",
    );
    if (response.isOk) {
      toast_notif("Works added to presentation.", "success");
      setIsAddModalOpen(false); // Close the modal
      // Instantly refresh the grid to show the new works
      queryClient.invalidateQueries({
        queryKey: ["eventDashboard", eventId, user.gallery_id],
      });
    } else {
      toast_notif(response.message, "error");
    }
  };

  // 1. React Query handles all the fetching and caching states
  const {
    data: dashboardData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["eventDashboard", eventId, user.gallery_id],
    queryFn: async () => {
      // Safety check just in case the query runs before auth finishes
      if (!user?.gallery_id) throw new Error("Unauthorized");

      const response = await fetchEventDashboardData(
        eventId,
        user.gallery_id,
        csrf || "",
      );

      // If the API returns an explicit failure, throw it so React Query registers an error
      if (!response.isOk || !response.data) {
        throw new Error(response.message || "Event not found");
      }

      // Return ONLY the data payload to become `dashboardData`
      return response.data;
    },
    // Prevent the query from firing until the user object is fully hydrated
    enabled: !!user?.gallery_id && !!eventId,
    // Optional: Keep the data fresh, but don't spam the server on every window focus
    refetchOnWindowFocus: false,
  });

  // 2. Handle side-effects (Routing & Toasts) when a fetch fails
  useEffect(() => {
    if (isError) {
      toast_notif(
        error instanceof Error ? error.message : "Failed to load event data.",
        "error",
      );
      router.push("/gallery/programming");
    }
  }, [isError, error, router]);

  // 3. Loading State (React Query provides `isLoading` natively)
  if (isLoading || !dashboardData) {
    return (
      <div className="w-full h-96 flex items-center justify-center">
        <svg
          className="animate-spin h-8 w-8 text-dark"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      </div>
    );
  }

  const { event, artworks } = dashboardData;

  // 5. The Render
  return (
    <div className="w-full max-w-full mx-auto py-6 space-y-12">
      <EventDashboardHeader
        event={event}
        onEditClick={() => setIsEditModalOpen(true)}
        isUploadingCover={isUploadingCover}
        onCoverImageChange={handleCoverImageChange}
      />
      <VipLinkManager event={event} />

      {/* 2. Analytics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            label: "Page Views",
            value: event.analytics?.views || 0,
            trend: event.analytics?.views_trend || "+0%",
          },
          {
            label: "View In Room Activations",
            value: event.analytics?.view_in_room || 0,
            trend: event.analytics?.view_in_room_trend || "+0%",
          },
          {
            label: "Public Shares",
            value: event.analytics?.shares || 0,
            trend: event.analytics?.shares_trend || "+0%",
          },
        ].map((metric, idx) => (
          <div
            key={idx}
            className="bg-white border border-neutral-200 p-6 rounded-sm shadow-sm flex flex-col"
          >
            <span className="text-[10px] text-neutral-400 uppercase tracking-widest mb-4">
              {metric.label}
            </span>
            <div className="flex items-end gap-3">
              <span className="text-3xl font-normal text-dark">
                {metric.value.toLocaleString()}
              </span>
              <span className="text-xs text-green-600 font-medium mb-1">
                {metric.trend}
              </span>
            </div>
          </div>
        ))}
      </div>

      <InstallationViewsManager
        eventId={event.event_id}
        galleryId={user.gallery_id}
        existingViews={event.installation_views || []}
        onUploadSuccess={() =>
          queryClient.invalidateQueries({
            queryKey: ["eventDashboard", eventId, user.gallery_id],
          })
        }
      />

      {/* STEP 4: Live Inventory Management */}
      <EventInventoryGrid
        eventId={event.event_id}
        artworks={artworks}
        onAddInventoryClick={() => setIsAddModalOpen(true)}
        onRemoveArtwork={handleRemoveArtwork}
        onReorderArtworks={async (newIds) => {
          await updateArtworkSequence(
            event.event_id,
            event.gallery_id,
            newIds,
            csrf || "",
          );
        }}
      />

      {/* The Reusable Selector Modal */}
      <ArtworkSelectorModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        galleryId={user.gallery_id}
        validatedPayload={null} // We aren't creating a new event, just adding works
        onFinalSubmit={handleAddArtworks}
        alreadyFeaturedIds={artworks.map((a: ArtworkSchemaTypes) => a.art_id)}
      />

      {/* STEP 5: The Danger Zone */}
      {!event.is_archived && (
        <div className="mt-16 pt-8 border-t border-red-100">
          <div className="bg-red-50/50 border border-red-100 rounded-sm p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-sm font-medium text-red-900">
                Archive Event
              </h3>
              <p className="text-xs text-red-700 mt-1 max-w-xl tracking-wide">
                Archiving this event will remove it from your active programming
                and automatically release all attached artworks back into your
                available vault.
              </p>
            </div>
            <button
              // CHANGED: Open the modal instead of firing the action
              onClick={() => setIsArchiveModalOpen(true)}
              disabled={isArchiving}
              className="px-6 py-2.5 text-xs font-medium tracking-widest uppercase transition-all duration-300 rounded-sm bg-red-600 text-white hover:bg-red-700 shadow-sm shrink-0 disabled:opacity-50"
            >
              {isArchiving ? "Archiving..." : "Archive Presentation"}
            </button>
          </div>
        </div>
      )}

      <EditEventModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        event={event}
        galleryId={user.gallery_id}
        onSuccess={() => {
          // This magically refreshes the dashboard with the new title/dates!
          queryClient.invalidateQueries({
            queryKey: ["eventDashboard", eventId, user.gallery_id],
          });
        }}
      />
      <ConfirmActionModal
        isOpen={isArchiveModalOpen}
        title="Archive Presentation"
        message="Are you sure you want to archive this event? This will immediately remove it from your public profile and release all attached artworks back to your available inventory. This action cannot be undone."
        confirmText="Archive Event"
        isDestructive={true}
        onConfirm={handleArchiveEvent}
        onCancel={() => setIsArchiveModalOpen(false)}
      />
    </div>
  );
};
