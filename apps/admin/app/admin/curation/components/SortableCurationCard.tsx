import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { resolveImageUrls } from "../utils";

interface SortableCurationCardProps {
  item: { type: string; identifier: string; [key: string]: any };
  onRemove: (identifier: string) => void;
  index: number;
}

function resolveImage(item: any, type: string): string {
  const d = item;

  return resolveImageUrls(d, type) ?? "";
}

const TYPE_COLORS: Record<string, string> = {
  artwork: "#C9A96E",
  gallery: "#7E9E8A",
  events: "#9B7FB5",
  article: "#6B91B5",
  promotionals: "#C07A6E",
};

export function SortableCurationCard({
  item,
  onRemove,
  index,
}: SortableCurationCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.identifier });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : "auto",
  };

  const isMissing = item.isMissingData;
  const image = resolveImage(item.data, item.type);
  const title =
    item.data?.title ||
    item.data?.headline ||
    item.data?.name ||
    item.identifier;
  const typeColor = TYPE_COLORS[item.type] || "#78716C";

  if (isMissing) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="flex items-center gap-3 px-3 py-[0.6rem] mb-[0.45rem] bg-[#FBF4F2] border border-dashed border-[#C0614A] rounded-[2px] transition-all duration-150 ease-in-out relative opacity-60 justify-start"
      >
        <span className="font-serif text-base text-[#C0614A] mr-1">—</span>
        <span className="text-[0.78rem] text-[#78716C] italic flex-1">
          This work is no longer available
        </span>
        <button
          onClick={() => onRemove(item.identifier)}
          className="shrink-0 w-[22px] h-[22px] flex items-center justify-center text-base leading-none text-[#D4CFC9] bg-transparent border-none rounded-full cursor-pointer transition-all duration-[120ms] hover:text-[#C0614A] hover:bg-[#FAF8F5]"
          title="Remove"
        >
          ×
        </button>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, opacity: isDragging ? 0.4 : 1 }}
      className={`flex items-center gap-3 px-3 py-[0.6rem] mb-[0.45rem] bg-[#FAF8F5] border rounded-[2px] transition-all duration-150 ease-in-out relative ${
        isDragging
          ? "border-[#E8E4DF] shadow-[0_8px_24px_rgba(28,25,23,0.12)]"
          : "border-[#E8E4DF] hover:border-[#D4CFC9] hover:shadow-[0_2px_8px_rgba(28,25,23,0.06)]"
      }`}
    >
      {/* Index number */}
      <span className="font-serif text-[0.75rem] font-normal text-[#D4CFC9] w-6 text-right shrink-0">
        {String(index + 1).padStart(2, "0")}
      </span>

      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="text-[#D4CFC9] cursor-grab shrink-0 p-[0.2rem] rounded-[1px] transition-colors duration-[120ms] hover:text-[#78716C] active:cursor-grabbing leading-none"
        title="Drag to reorder"
      >
        <svg width="10" height="16" viewBox="0 0 10 16" fill="none">
          {[0, 6, 12].map((y) => (
            <g key={y}>
              <circle cx="2" cy={y + 2} r="1.5" fill="currentColor" />
              <circle cx="8" cy={y + 2} r="1.5" fill="currentColor" />
            </g>
          ))}
        </svg>
      </div>

      {/* Thumbnail */}
      <div className="w-[42px] h-[42px] shrink-0 rounded-[1px] overflow-hidden bg-[#E8E4DF]">
        {image ? (
          <img src={image} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center font-serif text-[1.1rem] text-[#D4CFC9]">
            <span>{item.type[0].toUpperCase()}</span>
          </div>
        )}
      </div>

      {/* Meta */}
      <div className="flex-1 min-w-0 flex flex-col gap-[0.1rem]">
        <span
          className="text-[0.6rem] font-medium tracking-[0.12em] uppercase"
          style={{ color: typeColor }}
        >
          {item.type}
        </span>
        <span className="font-serif text-[0.8rem] font-normal text-[#1C1917] whitespace-nowrap overflow-hidden text-ellipsis">
          {title}
        </span>
      </div>

      {/* Remove */}
      <button
        onClick={() => onRemove(item.identifier)}
        className="shrink-0 w-[22px] h-[22px] flex items-center justify-center text-[1rem] leading-none text-[#D4CFC9] bg-transparent border-none rounded-full cursor-pointer transition-all duration-[120ms] hover:text-[#C0614A] hover:bg-[#FBF4F2]"
        title="Remove from curation"
      >
        ×
      </button>
    </div>
  );
}
