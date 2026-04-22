"use client";

import React, { useState, useEffect } from "react";
import { toast_notif } from "@omenai/shared-utils/src/toast_notification";
import { ArtworkSchemaTypes } from "@omenai/shared-types";
import { getOptimizedImage } from "@omenai/shared-lib/storage/getImageFileView";
import { ConfirmActionModal } from "./ConfirmActionModal";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { SortableArtworkCard } from "./SortableArtworkCard";

// ----------------------------------------------------------------------
// 2. The Main Grid Component
// ----------------------------------------------------------------------
interface EventInventoryGridProps {
  eventId: string;
  artworks: ArtworkSchemaTypes[];
  onAddInventoryClick: () => void;
  onRemoveArtwork: (artworkId: string) => Promise<void>;
  // NEW: Prop to handle saving the newly ordered array of IDs to the DB
  onReorderArtworks: (newSequenceIds: string[]) => Promise<void>;
}

export const EventInventoryGrid = ({
  eventId,
  artworks,
  onAddInventoryClick,
  onRemoveArtwork,
  onReorderArtworks,
}: EventInventoryGridProps) => {
  const [isRemoving, setIsRemoving] = useState<string | null>(null);
  const [artworkToDelete, setArtworkToDelete] = useState<string | null>(null);

  // Local state for optimistic drag-and-drop UI updates
  const [items, setItems] = useState<ArtworkSchemaTypes[]>(artworks);

  // Sync local state if the parent updates the artworks (e.g. adding a new one)
  useEffect(() => {
    setItems(artworks);
  }, [artworks]);

  const confirmRemoval = async () => {
    if (!artworkToDelete) return;

    const idToRemove = artworkToDelete;
    setArtworkToDelete(null);
    setIsRemoving(idToRemove);

    try {
      await onRemoveArtwork(idToRemove);
    } catch (error) {
      toast_notif("Failed to remove artwork from event.", "error");
      setIsRemoving(null);
    }
  };

  // DND Kit Sensors config
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Prevents accidental drags when clicking the card
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Handle the drop event
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.art_id === active.id);
      const newIndex = items.findIndex((item) => item.art_id === over.id);

      // 1. Optimistically update the UI instantly
      const newlyOrderedItems = arrayMove(items, oldIndex, newIndex);
      setItems(newlyOrderedItems);

      // 2. Extract just the IDs for the database payload
      const newSequenceIds = newlyOrderedItems.map((item) => item.art_id);

      // 3. Save to database in the background
      try {
        await onReorderArtworks(newSequenceIds);
      } catch (error) {
        // Revert UI if the server action fails
        setItems(items);
        toast_notif("Failed to save the new order.", "error");
      }
    }
  };

  return (
    <div className="w-full flex flex-col space-y-6">
      {/* Grid Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-neutral-200 pb-4">
        <div>
          <h2 className="text-xl font-normal text-dark">Active Inventory</h2>

          {/* THE NEW INSTRUCTIONAL COPY */}
          <div className="mt-2 flex items-start gap-2 bg-neutral-50 border border-neutral-200 p-3 rounded-sm max-w-2xl">
            <svg
              className="w-5 h-5 text-neutral-600 shrink-0 mt-0.5"
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
            <p className="text-xs text-neutral-800 tracking-wide leading-relaxed">
              <strong>Curatorial Sequence:</strong> Hover over any artwork and
              use the grip icon{" "}
              <span className="inline-block align-middle mx-0.5 opacity-80">
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 8h16M4 16h16"
                  />
                </svg>
              </span>{" "}
              to drag and drop it into place. This exact order will be reflected
              on the live public presentation.
            </p>
          </div>
        </div>

        <button
          onClick={onAddInventoryClick}
          className="px-6 py-2.5 text-xs font-medium tracking-widest uppercase transition-all duration-300 rounded-sm bg-dark text-white hover:bg-neutral-800 shadow-sm flex items-center gap-2 shrink-0"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add Works
        </button>
      </div>

      {/* The Artwork Grid */}
      {items.length === 0 ? (
        <div className="w-full h-64 bg-neutral-50 border border-dashed border-neutral-300 flex flex-col items-center justify-center rounded-sm">
          <p className="text-sm text-neutral-500 tracking-wide mb-4">
            No artworks currently assigned to this event.
          </p>
          <button
            onClick={onAddInventoryClick}
            className="text-xs font-medium tracking-widest uppercase text-dark underline underline-offset-4 hover:text-neutral-600 transition-colors"
          >
            Select from Vault
          </button>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={items.map((item) => item.art_id)}
            strategy={rectSortingStrategy}
          >
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {items.map((artwork) => (
                <SortableArtworkCard
                  key={artwork.art_id}
                  artwork={artwork}
                  isRemoving={isRemoving}
                  onRemoveClick={setArtworkToDelete}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <ConfirmActionModal
        isOpen={!!artworkToDelete}
        title="Remove Artwork"
        message="Are you sure you want to remove this artwork from the presentation? It will immediately be released back into your available vault."
        confirmText="Remove Work"
        isDestructive={true}
        onConfirm={confirmRemoval}
        onCancel={() => setArtworkToDelete(null)}
      />
    </div>
  );
};
