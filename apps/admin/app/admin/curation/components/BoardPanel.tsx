import React from "react";
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
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableCurationCard } from "./SortableCurationCard"; // Assuming you already have this separate file
import { CurationItem, MAX_ITEMS } from "../curationTypes";

interface BoardPanelProps {
  draftItems: CurationItem[];
  isSaving: boolean;
  type: string;
  saveStatus: "idle" | "saved" | "error";
  isPublishing: boolean;
  handleSaveDraft: () => void;
  handlePublish: () => void;
  handleDragEnd: (event: DragEndEvent) => void;
  handleRemoveItem: (id: string) => void;
}

export default function BoardPanel({
  draftItems,
  isSaving,
  saveStatus,
  isPublishing,
  handleSaveDraft,
  handlePublish,
  handleDragEnd,
  handleRemoveItem,
}: BoardPanelProps) {
  const fillPercent = (draftItems.length / MAX_ITEMS) * 100;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#F3F0EB]">
      <div className="p-[1.1rem_1.5rem] border-b border-[#E8E4DF] flex items-end justify-between shrink-0 bg-[#F3F0EB]">
        <div>
          <h2 className="font-serif text-[1.2rem] font-medium text-[#1C1917] tracking-[0.01em] m-0 mb-[0.1rem]">
            Curation Board
          </h2>
          <div className="flex items-center gap-[0.6rem] mt-[0.4rem]">
            <div className="w-[80px] h-[2px] bg-[#E8E4DF] rounded-[1px] overflow-hidden">
              <div
                className="h-full bg-[#C9A96E] rounded-[1px] transition-all duration-300 ease-in-out"
                style={{ width: `${fillPercent}%` }}
              />
            </div>
            <span className="text-[0.72rem] font-medium text-[#44403C]">
              {draftItems.length}
              <span className="text-[#78716C] font-normal"> / {MAX_ITEMS}</span>
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleSaveDraft}
            disabled={isSaving}
            className="px-4 py-[0.45rem] font-sans text-[0.72rem] font-medium tracking-[0.06em] uppercase rounded-[1px] cursor-pointer transition-all duration-150 border disabled:opacity-40 disabled:cursor-not-allowed bg-transparent border-[#D4CFC9] text-[#44403C] hover:not(:disabled):border-[#44403C] hover:not(:disabled):text-[#1C1917]"
          >
            {isSaving
              ? "Saving…"
              : saveStatus === "saved"
                ? "✓ Saved"
                : "Save Draft"}
          </button>
          <button
            onClick={handlePublish}
            disabled={isPublishing || draftItems.length === 0}
            className="px-4 py-[0.45rem] font-sans text-[0.72rem] font-medium tracking-[0.06em] uppercase rounded-[1px] cursor-pointer transition-all duration-150 border disabled:opacity-40 disabled:cursor-not-allowed bg-[#1C1917] text-[#FAF8F5] border-[#1C1917] hover:not(:disabled):bg-[#44403C]"
          >
            {isPublishing ? "Publishing…" : "Publish Live"}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-[1.25rem_1.5rem] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#E8E4DF] [&::-webkit-scrollbar-thumb]:rounded-[2px]">
        {draftItems.length === 0 ? (
          <div className="h-full min-h-[200px] flex items-center justify-center">
            <div className="text-center border border-dashed border-[#D4CFC9] p-[2.5rem_2rem] rounded-[2px] w-full">
              <svg
                width="32"
                height="32"
                viewBox="0 0 32 32"
                fill="none"
                className="text-[#D4CFC9] mx-auto mb-4 block"
              >
                <rect
                  x="4"
                  y="4"
                  width="10"
                  height="10"
                  rx="1"
                  stroke="currentColor"
                  strokeWidth="1"
                />
                <rect
                  x="18"
                  y="4"
                  width="10"
                  height="10"
                  rx="1"
                  stroke="currentColor"
                  strokeWidth="1"
                />
                <rect
                  x="4"
                  y="18"
                  width="10"
                  height="10"
                  rx="1"
                  stroke="currentColor"
                  strokeWidth="1"
                />
                <rect
                  x="18"
                  y="18"
                  width="10"
                  height="10"
                  rx="1"
                  stroke="currentColor"
                  strokeWidth="1"
                />
              </svg>
              <p className="text-[0.8rem] text-[#78716C] leading-[1.7] m-0 font-normal">
                Hover over a work in the library
                <br />
                and press{" "}
                <em className="italic text-[#44403C]">Add to Curation</em> to
                begin.
              </p>
            </div>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={draftItems.map((i) => i.identifier)}
              strategy={verticalListSortingStrategy}
            >
              <div className="flex flex-col">
                {draftItems.map((item, idx) => (
                  <SortableCurationCard
                    key={item.identifier}
                    item={item}
                    onRemove={handleRemoveItem}
                    index={idx}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
}
