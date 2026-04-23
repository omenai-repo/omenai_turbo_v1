import React from "react";
import { resolveImageUrls, resolveTitle, resolveSubtitle } from "../utils";

interface LibraryCardProps {
  item: any;
  type: string;
  added: boolean;
  disabled: boolean;
  onAdd: () => void;
}

export default function LibraryCard({
  item,
  type,
  added,
  disabled,
  onAdd,
}: LibraryCardProps) {
  const image = resolveImageUrls(item, type);
  const title = resolveTitle(item);
  const subtitle = resolveSubtitle(item, type);

  return (
    <div
      className={`flex flex-col border rounded-[2px] overflow-hidden bg-white transition-all duration-200 cursor-default group ${
        added
          ? "opacity-45 border-[#E8E4DF]"
          : "border-[#E8E4DF] hover:shadow-[0_4px_16px_rgba(28,25,23,0.08)] hover:border-[#D4CFC9]"
      }`}
    >
      <div className="relative w-full pb-[80%] overflow-hidden bg-[#F3F0EB]">
        {image ? (
          <img
            src={image}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-[350ms] group-hover:scale-[1.03]"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-serif text-[2.5rem] font-light text-[#D4CFC9]">
              {title[0]?.toUpperCase()}
            </span>
          </div>
        )}

        {!added && !disabled && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 bg-[#1C1917]/45 backdrop-blur-[3px] transition-opacity duration-[220ms] group-hover:opacity-100">
            <button
              className="flex flex-col items-center gap-[0.35rem] text-[#FAF8F5] bg-transparent border border-[#FAF8F5]/50 rounded-[1px] px-[1.1rem] py-[0.65rem] cursor-pointer font-sans text-[0.62rem] font-medium tracking-[0.1em] uppercase transition-all duration-150 hover:bg-[#FAF8F5]/15 hover:border-[#FAF8F5]/85"
              onClick={onAdd}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <line
                  x1="10"
                  y1="3"
                  x2="10"
                  y2="17"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <line
                  x1="3"
                  y1="10"
                  x2="17"
                  y2="10"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              <span>Add to Curation</span>
            </button>
          </div>
        )}

        {added && (
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-[#FAF8F5]/90 text-[#44403C] text-[0.6rem] font-medium tracking-[0.08em] uppercase px-[0.45rem] py-[0.2rem] rounded-[1px] font-sans">
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
              <path
                d="M2 5.5L4.5 8L9 3"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Added
          </div>
        )}
      </div>

      <div className="p-[0.6rem_0.65rem_0.7rem]">
        <p className="font-serif text-[0.85rem] font-medium text-[#1C1917] m-0 mb-[0.15rem] whitespace-nowrap overflow-hidden text-ellipsis">
          {title}
        </p>
        {subtitle && (
          <p className="font-sans text-[0.65rem] text-[#78716C] m-0 whitespace-nowrap overflow-hidden text-ellipsis">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
