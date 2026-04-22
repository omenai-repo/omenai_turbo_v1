// components/programming/DraggableInventoryGrid.tsx
"use client";

import React, { useState, useEffect } from "react";
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
} from "@dnd-kit/sortable";
import { SortableArtworkCard } from "./SortableArtworkCard";
import { updateArtworkSequence } from "@omenai/shared-services/gallery/events/updateArtworkSequence";
import { toast_notif } from "@omenai/shared-utils/src/toast_notification";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";

interface DraggableInventoryGridProps {
  initialArtworks: any[]; // Replace with your exact Artwork type
  eventId: string;
  galleryId: string;
  onRemoveArtwork: (id: string) => void; // Your existing remove function
}

export const DraggableInventoryGrid = ({
  initialArtworks,
  eventId,
  galleryId,
  onRemoveArtwork,
}: DraggableInventoryGridProps) => {
  const { csrf } = useAuth({ requiredRole: "gallery" });
  // Local state for instant visual feedback
  const [items, setItems] = useState(initialArtworks);

  // Keep state synced if props change (e.g. adding/removing artworks)
  useEffect(() => {
    setItems(initialArtworks);
  }, [initialArtworks]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Prevents accidental drags when just clicking
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.artwork_id === active.id);
      const newIndex = items.findIndex((item) => item.artwork_id === over.id);

      // 1. Optimistically update UI instantly
      const newlyOrderedItems = arrayMove(items, oldIndex, newIndex);
      setItems(newlyOrderedItems);

      // 2. Extract just the IDs in the new order for the database
      const newSequenceIds = newlyOrderedItems.map((item) => item.artwork_id);

      // 3. Save to database in the background
      const res = await updateArtworkSequence(
        eventId,
        galleryId,
        newSequenceIds,
        csrf || "",
      );

      if (!res.isOk) {
        // Rollback on failure
        setItems(items);
        toast_notif(res.message, "error");
      }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={items.map((item) => item.artwork_id)} // Must pass array of unique IDs
        strategy={rectSortingStrategy} // Optimized for grids
      >
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {items.map((artwork) => (
            <SortableArtworkCard
              key={artwork.artwork_id}
              artwork={artwork}
              onRemove={onRemoveArtwork}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};
