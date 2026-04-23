import React from "react";
import LibraryCard from "./LibraryCard";
import { CurationItem, LIBRARY_TABS, MAX_ITEMS } from "../curationTypes";
import { resolveIdentifier } from "../utils";

interface LibraryPanelProps {
  curationType: string;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isLoadingLibrary: boolean;
  libraryItems: any[];
  draftItems: CurationItem[];
  handleAddItem: (item: any) => void;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  page: number;
  setPage: (val: number | ((prev: number) => number)) => void;
  totalPages: number;
}

export default function LibraryPanel({
  curationType,
  activeTab,
  setActiveTab,
  isLoadingLibrary,
  libraryItems,
  draftItems,
  handleAddItem,
  searchQuery,
  setSearchQuery,
  page,
  setPage,
  totalPages,
}: LibraryPanelProps) {
  const isItemInDraft = (id: string) =>
    draftItems.some((i) => i.identifier === id);

  return (
    <div className="w-[55%] flex flex-col overflow-hidden bg-[#FAF8F5]">
      <div className="border-b border-[#E8E4DF] shrink-0">
        <div className="pt-[1.1rem] px-[1.5rem] pb-[0.7rem] flex items-start justify-between">
          <div>
            <h2 className="font-serif text-[1.2rem] font-medium text-[#1C1917] tracking-[0.01em] m-0 mb-[0.1rem]">
              Library
            </h2>
            <p className="text-[0.68rem] text-[#78716C] tracking-[0.08em] uppercase m-0 font-sans">
              Browse and select works
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-[1.5rem] pb-[0.7rem]">
          <div className="relative flex items-center w-full bg-[#F3F0EB] border border-[#E8E4DF] rounded-[2px] transition-colors focus-within:border-[#D4CFC9]">
            <svg
              className="w-4 h-4 ml-3 text-[#78716C] absolute"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder={`Search ${activeTab}s...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-2 pl-9 pr-4 bg-transparent border-none text-[0.8rem] text-[#1C1917] placeholder:text-[#78716C] focus:ring-0 focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 text-[#78716C] hover:text-[#1C1917]"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Tabs */}
        <div className="flex px-[1.5rem] overflow-x-auto gap-0 [&::-webkit-scrollbar]:hidden">
          {LIBRARY_TABS.map((tab) => {
            // Hide non-artwork tabs if the user is curating "Curator Picks"
            if (curationType === "curator_picks" && tab.id !== "artwork") {
              return null;
            }

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-[0.9rem] py-[0.55rem] font-sans text-[0.72rem] font-medium tracking-[0.06em] uppercase bg-transparent border-none border-b-2 cursor-pointer whitespace-nowrap transition-colors duration-150 ${
                  activeTab === tab.id
                    ? "text-[#1C1917] border-[#1C1917]"
                    : "text-[#78716C] border-transparent hover:text-[#1C1917] hover:border-[#D4CFC9]"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-[1.25rem_1.5rem] flex flex-col [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#E8E4DF] [&::-webkit-scrollbar-thumb]:rounded-[2px]">
        {isLoadingLibrary ? (
          <div className="flex items-center justify-center min-h-[200px]">
            <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-4 w-full">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-[2px]">
                  <div className="w-full pb-[80%] bg-[#E8E4DF] rounded-[2px] mb-2 animate-pulse" />
                  <div className="h-[10px] rounded-[1px] bg-[#E8E4DF] mb-[0.35rem] w-[85%] animate-pulse" />
                  <div className="h-[10px] rounded-[1px] bg-[#E8E4DF] mb-[0.35rem] w-[55%] animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        ) : libraryItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[200px] text-[#78716C] text-[0.8rem] tracking-[0.05em]">
            <p>No items found</p>
            {searchQuery && (
              <p className="text-[0.7rem] mt-1">
                Try adjusting your search terms
              </p>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-4 mb-6">
              {libraryItems.map((item) => {
                const id = resolveIdentifier(item, activeTab);
                const added = isItemInDraft(id);
                return (
                  <LibraryCard
                    key={id}
                    item={item}
                    type={activeTab}
                    added={added}
                    disabled={draftItems.length >= MAX_ITEMS}
                    onAdd={() => handleAddItem(item)}
                  />
                );
              })}
            </div>

            {/* Pagination Footer */}
            {totalPages > 1 && (
              <div className="mt-auto pt-4 flex items-center justify-between border-t border-[#E8E4DF]">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 text-[0.72rem] font-medium tracking-[0.04em] uppercase border border-[#E8E4DF] rounded-[1px] text-[#44403C] hover:not(:disabled):bg-[#F3F0EB] disabled:opacity-40 transition-colors"
                >
                  Previous
                </button>
                <span className="text-[0.72rem] text-[#78716C] font-medium">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 text-[0.72rem] font-medium tracking-[0.04em] uppercase border border-[#E8E4DF] rounded-[1px] text-[#44403C] hover:not(:disabled):bg-[#F3F0EB] disabled:opacity-40 transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
